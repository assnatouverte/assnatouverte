import parser from 'any-date-parser';

export const extractDate = (dateStr: string) => {
    dateStr = dateStr.replace(/1er/g, '1'); // Remove the "er" in "1er"
    const result = parser.fromString(dateStr, 'fr');
    if (result.invalid) {
        throw result.invalid;
    }

    return result;
}

export const extractDateStr = (dateStr: string) => {
    return extractDate(dateStr)?.toISOString().slice(0, 10);
}
