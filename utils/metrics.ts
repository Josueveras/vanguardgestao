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
    return `${value.toFixed(1)}%`;
};

/**
 * Core Logic: Calculate "Stock" Trend (Cumulative)
 * Use for: Active MRR, Active Clients, Pipeline Size.
 * Logic: Current Total vs (Current Total - Created This Month).
 * This assumes "Active" means they are currently present, and we subtract NEW ones to estimate previous stock.
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
    // These are the ones contributing to growth this month.
    const newItemsThisMonth = activeItems.filter(i => {
        const d = new Date(i.created_at || i.createdAt || now.toISOString()); // Fallback to now if no date, but ideally needs date
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    // 3. Calculate Current Value
    let currentValue = 0;
    if (valueField) {
        currentValue = activeItems.reduce((acc, item) => acc + (Number(item[valueField]) || 0), 0);
    } else {
        currentValue = activeItems.length;
    }

    // 4. Calculate Previous Value (Stock at start of month)
    // Previous = Current - New Growth
    // Note: This ignores Churn for simplicity unless we have a 'cancelled_at' date. 
    // Ideally: Previous = Current - New + Churned
    let growthValue = 0;
    if (valueField) {
        growthValue = newItemsThisMonth.reduce((acc, item) => acc + (Number(item[valueField]) || 0), 0);
    } else {
        growthValue = newItemsThisMonth.length;
    }

    const previousValue = currentValue - growthValue;

    // 5. Calculate Trend
    let changePercent = 0;
    if (previousValue > 0) {
        changePercent = ((currentValue - previousValue) / previousValue) * 100;
    } else if (currentValue > 0) {
        changePercent = 100; // 0 -> X is infinite growth, treating as 100%
    } else {
        changePercent = 0; // 0 -> 0
    }

    const trend: Trend = changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'neutral';

    return {
        value: currentValue,
        formatted: valueField ? formatCurrency(currentValue) : currentValue.toString(),
        change: `${Math.abs(Math.round(changePercent))}%`,
        trend,
        numericTrend: changePercent
    };
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

    let changePercent = 0;
    if (previousValue > 0) {
        changePercent = ((currentValue - previousValue) / previousValue) * 100;
    } else if (currentValue > 0) {
        changePercent = 100;
    }

    const trend: Trend = changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'neutral';

    return {
        value: currentValue,
        formatted: valueField ? formatCurrency(currentValue) : currentValue.toString(),
        change: `${Math.abs(Math.round(changePercent))}%`,
        trend,
        numericTrend: changePercent
    };
};

/**
 * Helper: Aggregate Generic Field
 */
export const aggregate = (items: any[], field: string): number => {
    return items.reduce((acc, item) => acc + (Number(item[field]) || 0), 0);
};
