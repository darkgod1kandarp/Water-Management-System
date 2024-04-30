import ExcelJS from 'exceljs';
interface CustomerRow {
    'Customer Name': string;
    'Bottle Tally': number;
    'Route': string;
    'Address': string;
    'Bottle Delivered': number;
    'Bottle Received': number;
}


const jsonToExcel = async (data: CustomerRow[])  => { 
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Customer Data');
    sheet.columns = [
        { header: 'Customer', key: 'Customer Name', width: 20 },
        { header: 'Bottle Tally', key: 'Bottle Tally', width: 20 },
        { header: 'Route', key: 'Route', width: 20 },
        { header: 'Address', key: 'Address', width: 20 },
        { header: 'Bottle Delivered', key: 'Bottle Delivered', width: 20 },
        { header: 'Bottle Received', key: 'Bottle Received', width: 20 }
    ];

    sheet.addRows(data);

    await workbook.xlsx.writeFile('uploads/customer-data.xlsx');

    return 'uploads/customer-data.xlsx';

}

export default jsonToExcel;