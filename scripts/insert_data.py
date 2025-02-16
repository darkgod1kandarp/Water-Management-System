import os  
import pandas as pd   
import json   
from pathlib import Path  
import psycopg2  
import argparse
from datetime import datetime

class InsertData:  
    def __init__(self, csv_file: str, config_file: str):     
        """
        Initializes the InsertData class by loading the CSV file into a DataFrame,
        preprocessing the data, and establishing a database connection.

        :param csv_file: Path to the CSV file containing customer data.
        :param config_file: Path to the JSON configuration file for database connection.
        """
        self.df: pd.DataFrame = pd.read_csv(csv_file)
        self.preprocess_data()
        self.cursor = None   
        self.conn = None
        self.connect_db(config_file)    
    
    def connect_db(self, config_file):   
        """
        Establishes a connection to the PostgreSQL database using credentials from a JSON config file.

        :param config_file: Path to the JSON configuration file.
        """
        _config_file = Path(config_file)      
        with _config_file.open('r') as f:   
            _config = json.load(f)    
        
        config = _config['production']    
        
        try:
            conn = psycopg2.connect(
                dbname=config['database'],
                user=config['username'],
                password=config['password'],
                host=config['host'],
                port=config['port']
            )
            self.cursor = conn.cursor()  
            self.conn = conn
        except Exception as e:
            print("Error:", e)
            os._exit(0)
    
    def insert_data(self):   
        """
        Inserts customer and route data into the PostgreSQL database.
        Skips inserting `NaN` values dynamically.
        """
        self.data = self.df.to_dict(orient='records')    
        routes = list(self.get_unique_routes())
        created_at = updated_at = datetime.utcnow()

        try:
            # Insert unique routes into the database
            for route in routes:
                insert_query = '''INSERT INTO routes (route_name, "createdAt", "updatedAt") VALUES (%s, %s, %s) 
                                  ON CONFLICT (route_name) DO NOTHING;'''
                self.cursor.execute(insert_query, (route, created_at, updated_at))   
                self.conn.commit()   
        except Exception as e:
            self.conn.rollback()
            print(f"Skipping existing route: {route} | Error: {e}")

        # Insert customer data
        for row in self.data:   
            row = {k: v for k, v in row.items() if pd.notna(v)}  # Remove NaN values
            
            if 'route_name' in row:
                route_name = row['route_name']
                query = "SELECT id FROM routes WHERE route_name = %s;"
                self.cursor.execute(query, (route_name,))  
                route_info = self.cursor.fetchone()  
                if route_info:
                    row['route_id'] = route_info[0]

            # Add timestamps
            row["createdAt"] = created_at
            row["updatedAt"] = updated_at
            del row['route_name']

            # Dynamically build the INSERT query based on available (non-null) columns
            columns = ', '.join(f'"{col}"' for col in row.keys())
            values_placeholder = ', '.join(['%s'] * len(row))
            insert_query = f'INSERT INTO customers ({columns}) VALUES ({values_placeholder});'

            try:
                self.cursor.execute(insert_query, tuple(row.values()))
                self.conn.commit()
            except Exception as e:
                self.conn.rollback()
                print(f"Error inserting row: {row} | Error: {e}")
    
    def get_unique_routes(self):   
        """
        Extracts unique route names from the dataset.

        :return: A set of unique route names.
        """
        routes = set()
        for row in self.data:  
            routes.add(row['route_name'])
        return routes
    
    def preprocess_data(self):      
        """
        Preprocesses the DataFrame by removing empty columns, converting strings to lowercase,
        dropping unnecessary columns, and renaming columns.
        """
        self.df = self.df.dropna(axis=1, how='all')
        self.df = self.df.applymap(lambda x: x.strip().lower() if isinstance(x, str) else x)
        
        if 'DISPENSER' in self.df.columns:
            self.df = self.df.drop('DISPENSER', axis=1)      
        
        self.df.rename(columns={
            "NAME": 'name',  
            "AREA": 'route_name',  
            "ADDRESS": 'address', 
            "BOTTLE": 'bottle_tally',   
            "CONT": "phoneNumber", 
            "PRICE": "bottle_charge"
        }, inplace=True)  
        

if __name__=="__main__":     
    parser = argparse.ArgumentParser()   
    parser.add_argument("--config_file")    
    parser.add_argument("--csv_file")
    args = parser.parse_args()  
    
    config_file = args.config_file  
    csv_file = args.csv_file  
    _insert_data = InsertData(csv_file=csv_file, config_file=config_file)   
    _insert_data.insert_data()      