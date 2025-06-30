import { Timesheet, User, Client } from '../types';

const escapeCsvField = (field: string | number | undefined): string => {
    if (field === undefined || field === null) {
        return '';
    }
    const stringField = String(field);
    // If the field contains a comma, double quote, or newline, wrap it in double quotes
    // and escape any existing double quotes by doubling them up.
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
}

export const exportInvoiceToCsv = (timesheet: Timesheet, contractor: User, client: Client) => {
    const headers = [
        'InvoiceNo', 'Customer', 'InvoiceDate', 'DueDate', 
        'Item(Product/Service)', 'Description', 'Qty', 'Rate', 'Amount'
    ];

    const invoiceDate = new Date(`${timesheet.invoiceDate}T00:00:00`).toLocaleDateString('en-US');
    const service = timesheet.invoiceService || contractor.serviceTitle || 'Consulting Services';
    const description = timesheet.invoiceDescription || `Services provided by ${contractor.name} for pay period ending ${timesheet.payPeriodEnd}`;

    const row = [
        timesheet.invoiceNumber,
        client.name,
        invoiceDate,
        invoiceDate, // DueDate is same as InvoiceDate
        service,
        description,
        timesheet.totalHours,
        contractor.hourlyRate,
        timesheet.totalCost
    ].map(escapeCsvField);

    const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + row.join(",");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `invoice_${timesheet.invoiceNumber}_${client.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
}