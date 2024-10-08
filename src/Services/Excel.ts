import ExcelJS from 'exceljs';
interface CustomerCummulativeRow {
    'Customer Name': string;
    'Bottle Tally': number;
    'Route': string;
    'Address': string;
    'Bottle Delivered': number;
    'Bottle Received': number;
    'Per Bottle Charge': number;
    'Revenue': number;
}

interface IndividualEntry {
    'Customer Name': string;
    'Bottle Tally': number;
    'Route': string;
    'Address': string;
    'Bottle Delivered': number;
    'Bottle Received': number;
    'Driver': string;
    'Per Bottle Charge': number;
    'Amount': number;
    'Date': string;
}


export const jsonToCummulativeExcel = async (data: CustomerCummulativeRow[]) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Customer Data');
    sheet.columns = [
        { header: 'Customer', key: 'Customer Name', width: 20 },
        { header: 'Bottle Tally', key: 'Bottle Tally', width: 20 },
        { header: 'Route', key: 'Route', width: 20 },
        { header: 'Address', key: 'Address', width: 20 },
        { header: 'Bottle Delivered', key: 'Bottle Delivered', width: 20 },
        { header: 'Bottle Received', key: 'Bottle Received', width: 20 },
       
        { header: 'Per Bottle Charge', key: 'Per Bottle Charge', width: 20 },
        { header: 'Revenue', key: 'Revenue', width: 20 },
       
    ];

    sheet.addRows(data);
    const filename = `customer-data-${new Date().getTime()}.xlsx`;
    await workbook.xlsx.writeFile(`uploads/${filename}`);
    return `uploads/${filename}`

};

export const jsonToIndividualExcel = async (data: IndividualEntry[]) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Customer Data');
    sheet.columns = [
        { header: 'Date', key: 'Date', width: 20 },
        { header: 'Customer', key: 'Customer Name', width: 20 },
        { header: 'Driver', key: 'Driver', width: 20 },
        { header: 'Per Bottle Charge', key: 'Per Bottle Charge', width: 20 },
        { header: 'Route', key: 'Route', width: 20 },
        { header: 'Address', key: 'Address', width: 20 },
        { header: 'Bottle Delivered', key: 'Bottle Delivered', width: 20 },
        { header: 'Mode Of Payment', key: 'Mode of Payment', width: 20 },
        { header: 'Bottle Received', key: 'Bottle Received', width: 20 },
        { header: 'Bottle Tally', key: 'Bottle Tally', width: 20 },
        { header: 'Amount', key: 'Amount', width: 20 }
    ];
    sheet.addRows(data);
    const filename = `customer-logs-data-${new Date().getTime()}.xlsx`;
    await workbook.xlsx.writeFile(`uploads/${filename}`);
    return `uploads/${filename}`
 }

