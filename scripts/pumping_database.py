import psycopg2
import argparse
import json
from coolname import generate_slug
import random
from datetime import datetime
import bcrypt
from datetime import timedelta

existing_name = {}
def db_connection(test_env:str): 
    f = open('../src/config/config.json','r')
    config = json.load(f)   
    db_config = config[test_env]
    try:
        connection = psycopg2.connect(
            dbname=db_config['database'],
            user=db_config['username'],
            password=db_config['password'],
            host=db_config['host'],
            port=db_config['port']
        )
        return connection.cursor(), connection

    except psycopg2.Error as e:
        print("Error: Could not connect to PostgreSQL database:", e)

def filling_user_table(cursor, connection):     
    name =  generate_slug(2)
    salt =  "$2a$10$Ur4McDr64HYDC1SL5XKpSu"
    password = bcrypt.hashpw('user_password'.encode('utf-8'),salt=salt.encode('utf-8')).decode('utf-8')
    while not existing_name.get(name):
        name = generate_slug(2)
        existing_name[name] = True
    role =  random.choice(['driver','admin','sales'])
    cursor.execute('INSERT INTO users (username, password, "role", "isNew", "createdAt", "updatedAt") VALUES (%s, %s, %s, %s, %s, %s);', (name, password, role, True,datetime.now(), datetime.now()))
    connection.commit()

def filling_route_table(cursor, connection):
    name = generate_slug(3)
    while not existing_name.get(name):
        name = generate_slug(3)
        existing_name[name] = True   
    cursor.execute('INSERT INTO routes (route_name, "createdAt", "updatedAt") VALUES (%s, %s, %s);', (name, datetime.now(), datetime.now()))
    connection.commit()   

def filling_customer_table(cursor, connection):
    name = generate_slug(3)
    address = generate_slug(4)
    while not existing_name.get(name):
        name = generate_slug(3)
        existing_name[name] = True
    cursor.execute('SELECT id FROM routes')
    routes = cursor.fetchall()
    route_id = random.choice(routes)[0]
    cursor.execute('INSERT INTO customers (name, route_id, bottle_tally, address, "createdAt", "updatedAt") VALUES (%s, %s, %s, %s, %s, %s);', (name, route_id, 1, address, datetime.now(), datetime.now()))
    connection.commit()

def filling_truck_table(cursor, connection):
    cursor.execute('INSERT INTO trucks (truck_no, "createdAt", "updatedAt") VALUES (%s, %s, %s);', (generate_slug(3), datetime.now(), datetime.now()))
    connection.commit()
    
def filling_driver_entries(cursor, connection):
    cursor.execute('SELECT id FROM customers')
    customers = cursor.fetchall()
    customer_id = random.choice(customers)[0]
    cursor.execute('SELECT id FROM trucks')
    trucks = cursor.fetchall()
    truck_id = random.choice(trucks)[0]
    cursor.execute('SELECT id FROM users WHERE "role" = %s', ('driver',) )
    drivers = cursor.fetchall()
    driver_id = random.choice(drivers)[0]
    createdAt = datetime.now() - timedelta(days=random.randint(1, 30))
    cursor.execute('INSERT INTO driver_entries (customer_id, bottle_delivered, bottle_received, bottle_tally, truck_no, driver_id, "createdAt", "updatedAt") VALUES (%s, %s, %s, %s, %s, %s, %s, %s);', (customer_id, 1, 1, 1, truck_id, driver_id, createdAt, createdAt))
    connection.commit()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--test_env", help="The environment to use for testing", default="testing")
    parser.add_argument("--no_of_entries", help="The number of entries to pump into the database", default=10, type=int)
    args = parser.parse_args()
    cursor, connection = db_connection(args.test_env)  
    for i in range(args.no_of_entries):
        filling_user_table(cursor, connection=connection) 
        filling_route_table(cursor, connection=connection)
        filling_customer_table(cursor, connection=connection)
        filling_truck_table(cursor, connection=connection)
        filling_driver_entries(cursor, connection=connection)

    




