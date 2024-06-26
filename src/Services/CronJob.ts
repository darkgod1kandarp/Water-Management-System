import Cron from 'node-cron';
import { generateIndividualReport, generateReport } from '../utils/driver';
import { DateTime } from 'luxon';
import { jsonToCummulativeExcel, jsonToIndividualExcel } from './Excel';
import { readFile, readFileSync } from 'fs';
import { SendEmail, templates } from './SendEmail';
import { ReportTemplateData } from './types';
import { getOrdinalSuffix } from '../utils/timer';
import { rimraf } from 'rimraf';

const getMonthWeekNumber = (date: DateTime): number => {
    // Get the required values
    const dayOfMonth = date.day;
    const weekDayOfFirstDayOfMonth = date
        .startOf('month').weekday;
    // Calculate the week of the month
    return Math.floor((dayOfMonth + weekDayOfFirstDayOfMonth - 1) / 7) + 1;

}


export default class CronJob {
    constructor() {
        this.start();
    }
    async sendReportEmail(isWeekly: boolean = false) {
        const start = isWeekly ? DateTime.now().minus({ weeks: 1 }).startOf('week') : DateTime.now().minus({ months: 1 }).startOf('month');
        const end = isWeekly ? DateTime.now().minus({ weeks: 1 }).endOf('week') : DateTime.now().minus({ months: 1 }).endOf('month');
        const reports = await generateReport(start.toFormat('yyyy-MM-dd'), end.toFormat('yyyy-MM-dd'));
        const invidividualReport = Object.values(await generateIndividualReport({
            startDate: start.toFormat('yyyy-MM-dd'), endDate: end.toFormat('yyyy-MM-dd'),
            sortBy: 'createdAt',
            isPaginated: false
        })).map(
            (entry) => {
                return {
                    'Customer Name': entry.customer.name,
                    'Driver': entry.driver.name,
                    'Address': entry.customer.address,
                    'Route': entry.customer.route.route_name,
                    'Bottle Delivered': entry.bottle_delivered,
                    'Bottle Received': entry.bottle_received,
                    'Date': entry.createdAt,
                    'Bottle Tally': entry.bottle_tally,
                    'Per Bottle Charge': entry.customer.bottle_charge,
                    'Amount': entry.bottle_delivered * entry.customer.bottle_charge,
                }
            }
        );

        const url2 = await jsonToIndividualExcel(invidividualReport);

        const report = Object.values(reports).map(customer => {
            return {
                'Customer Name': customer.customer_name,
                'Bottle Tally': customer.bottle_tally,
                'Route': customer.route,
                'Address': customer.address,
                'Bottle Delivered': customer.bottle_delivered,
                'Bottle Received': customer.bottle_received,
                'Per Bottle Charge': customer.bottle_charge,
                'Revenue': customer.revenue

            }
        });
        const url = await jsonToCummulativeExcel(report);
        const buffer = readFileSync(url, { encoding: 'base64' });
        const buffer2 = readFileSync(url2, { encoding: 'base64' });
        const weeklyFileName = `customer-data-${getMonthWeekNumber(start)}${getOrdinalSuffix(getMonthWeekNumber(start))}-Week-of-${start.toFormat('MMMM')}.xlsx`;
        const monthlyFileName = `customer-data-${start.toFormat('MMMM')}.xlsx`;
        SendEmail({
            template: {
                id: templates.report,
                month: isWeekly ? `${getMonthWeekNumber(start)}${getOrdinalSuffix(getMonthWeekNumber(start))} Week of ${start.toFormat('MMMM')}` : DateTime.now().minus({ months: 1 }).toFormat('MMMM'),
                name: 'Webbound Support'
            },
            to: 'heetkv@gmail.com',
            attachments: [
                {
                    filename: `customer-data-${isWeekly ? weeklyFileName : monthlyFileName}.xlsx`,
                    content: buffer
                },
                {
                    filename: `customer-logs-data-${isWeekly ? weeklyFileName : monthlyFileName}.xlsx`,
                    content: buffer2
                }
            ],
            onSuccessfulSend: () => {
                console.log('Email sent successfully');
                return;
            }
        })
    }

    start() {
        // Run a task every 1st of the month at 00:00
        Cron.schedule('0 0 1 * *', async () => this.sendReportEmail());
        // Run a task every Monday at 00:00
        Cron.schedule('0 0 * * 1', async () => this.sendReportEmail(true));
        // Delete all the files in the uploads folder every 1st of the month at 00:00
        Cron.schedule('0 0 1 * *', () => {
            readFile('uploads', (err, files) => {
                if (err) return;
                for (const file of files) {
                    rimraf(`uploads/${file}`);
                }
            })
        })

    }
}