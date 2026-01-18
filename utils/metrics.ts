export type Trend = 'up' | 'down' | 'neutral';

export interface MetricResult {
    value: number;
    formatted: string;
    change: string; // "+10%", "-5%", "0%"
    trend: Trend;
    numericTrend: number; // useful for sorting or raw access
}

/**
 * Helper: Format Currency (BRL)
 */
export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0,
    }).format(value);
};

/**
 * Helper: Format Percent
 */
export const formatPercent = (value: number) => {
    if (!isFinite(value)) return '0%';
    return `${value.toFixed(1)}%`;
};

/**
 * Core Logic: Calculate "Stock" Trend (Cumulative)
 * Use for: Active MRR, Active Clients, Pipeline Size.
 * Logic: Current Total vs (Current Total - Created This Month).
 * Note: This implements "Net Growth" logic. It assumes Previous = Current - New.
 * It strictly ignores Churn because we don't have cancellation dates. 
 * This is the safest approximation for "Growth this month".
 */
export const calculateStockMetrics = (
    items: any[],
    valueField?: string, // If null, counts items. If string, sums that field.
    filterActive?: (item: any) => boolean // Optional filter for "Active" items
): MetricResult => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    // 1. Filter Active Items (Current Stock)
    const activeItems = filterActive ? items.filter(filterActive) : items;

    // 2. Identify newly added items this month (Acquisition)
    const newItemsThisMonth = activeItems.filter(i => {
        const d = new Date(i.created_at || i.createdAt || now.toISOString());
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    // 3. Calculate Current Value
    let currentValue = 0;
    if (valueField) {
        currentValue = activeItems.reduce((acc, item) => acc + (Number(item[valueField]) || 0), 0);
    } else {
        currentValue = activeItems.length;
    }

    // 4. Calculate "Growth Value" (Accession)
    let growthValue = 0;
    if (valueField) {
        growthValue = newItemsThisMonth.reduce((acc, item) => acc + (Number(item[valueField]) || 0), 0);
    } else {
        growthValue = newItemsThisMonth.length;
    }

    // 5. Estimate Previous Value (Baseline)
    // Baseline = End State - Growth
    const previousValue = currentValue - growthValue;

    // 6. Calculate Trend
    return calculateSafeTrend(currentValue, previousValue, !!valueField);
};

/**
 * Core Logic: Calculate "Flow" Trend (Acquisition Rate)
 * Use for: New Sales, New Leads, Revenue (Sales).
 * Logic: Created This Month vs Created Last Month.
 */
export const calculateFlowMetrics = (
    items: any[],
    valueField?: string,
    dateField: string = 'created_at'
): MetricResult => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const currentItems = items.filter(i => {
        const d = new Date(i[dateField] || now.toISOString());
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    const previousItems = items.filter(i => {
        const d = new Date(i[dateField] || now.toISOString());
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });

    let currentValue = 0;
    let previousValue = 0;

    if (valueField) {
        currentValue = currentItems.reduce((acc: number, i: any) => acc + (Number(i[valueField]) || 0), 0);
        previousValue = previousItems.reduce((acc: number, i: any) => acc + (Number(i[valueField]) || 0), 0);
    } else {
        currentValue = currentItems.length;
        previousValue = previousItems.length;
    }

    return calculateSafeTrend(currentValue, previousValue, !!valueField);
};

/**
 * Shared Trend Calculation Logic (Safe)
 */
const calculateSafeTrend = (current: number, previous: number, isCurrency: boolean): MetricResult => {
    let changePercent = 0;

    if (previous > 0) {
        changePercent = ((current - previous) / previous) * 100;
    } else if (current > 0) {
        // From 0 to Something: Technically infinite growth, but we cap/handle gracefully
        changePercent = 100; 
    } else {
        // 0 to 0
        changePercent = 0;
    }

    // Safety Catch for NaN/Infinity
    if (!isFinite(changePercent)) changePercent = 0;

    const trend: Trend = changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'neutral';

    return {
        value: current,
        formatted: isCurrency ? formatCurrency(current) : current.toString(),
        change: `${changePercent > 0 ? '+' : ''}${Math.round(changePercent)}%`,
        trend,
        numericTrend: changePercent
    };
}

/**
 * Helper: Aggregate Generic Field
 */
export const aggregate = (items: any[], field: string): number => {
    return items.reduce((acc, item) => acc + (Number(item[field]) || 0), 0);
};

/**
 * Trend Color Logic (Centralized)
 */
export const getTrendColor = (value: number | null | undefined): string => {
    if (value === null || value === undefined || value === 0) {
        return 'bg-gray-100 text-gray-600'; // Neutral
    }
    if (value > 0) {
        return 'bg-green-50 text-green-700'; // Positive
    }
    return 'bg-red-50 text-red-700'; // Negative (value < 0)
};
