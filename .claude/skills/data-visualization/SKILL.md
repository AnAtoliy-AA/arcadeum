---
name: data-visualization
description: Implement accessible charts, graphs, and data tables with proper color, tooltips, and screen reader support. Use when adding charts, data displays, or analytics dashboards. Trigger on keywords like chart, graph, data, visualization, analytics, table.
---

# Data Visualization Skill

Implement accessible charts, graphs, and data tables with proper color, tooltips, and screen reader support.

## When to Use

- Adding charts or graphs to dashboards
- Displaying data tables with sorting/filtering
- Creating analytics visualizations
- Building data-heavy UIs
- Implementing interactive data displays

## Chart Selection Guide

| Data Type | Best Chart | Use Case |
|-----------|------------|----------|
| Trend over time | Line chart | Revenue, users, traffic |
| Comparison | Bar chart | Sales by region, features |
| Proportion | Donut/Pie chart | Market share, demographics |
| Distribution | Histogram | Age distribution, scores |
| Relationship | Scatter plot | Correlation analysis |
| Flow | Sankey diagram | User journeys, conversions |
| Hierarchy | Treemap | Categories, organizational |
| Geographic | Map chart | Regional data |

## Color Guidelines

### Accessible Palettes

```tsx
// Colorblind-safe palette
const palette = {
  blue: '#2563EB',
  orange: '#F97316',
  green: '#22C55E',
  purple: '#A855F7',
  red: '#EF4444',
  cyan: '#06B6D4',
  amber: '#F59E0B',
  pink: '#EC4899',
};

// High contrast palette
const highContrast = {
  primary: '#1E40AF',
  secondary: '#C2410C',
  tertiary: '#166534',
  quaternary: '#7E22CE',
};
```

### Color Rules

1. **Never rely on color alone** — Add patterns, labels, or icons
2. **Use colorblind-safe palettes** — Avoid red/green combinations
3. **Maintain contrast** — 3:1 for chart elements, 4.5:1 for labels
4. **Limit colors** — Max 7-8 colors per chart
5. **Consistent meaning** — Same color = same category throughout

### Pattern Supplement

```tsx
// Add patterns for colorblind accessibility
const patterns = {
  solid: '',
  striped: 'repeating-linear-gradient(45deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)',
  dotted: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
  crosshatch: 'repeating-linear-gradient(45deg, transparent, transparent 3px, currentColor 3px, currentColor 6px)',
};
```

## Chart Implementation

### Line Chart (Recharts)

```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 500 },
];

const Chart = () => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Line
        type="monotone"
        dataKey="value"
        stroke="#2563EB"
        strokeWidth={2}
        dot={{ r: 4 }}
        activeDot={{ r: 6 }}
      />
    </LineChart>
  </ResponsiveContainer>
);
```

### Bar Chart

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Chart = () => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);
```

### Donut Chart

```tsx
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Desktop', value: 60 },
  { name: 'Mobile', value: 30 },
  { name: 'Tablet', value: 10 },
];

const COLORS = ['#2563EB', '#F97316', '#22C55E'];

const Chart = () => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={80}
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={entry.name} fill={COLORS[index]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
);
```

## Data Tables

### Sortable Table

```tsx
const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

const sortedData = useMemo(() => {
  if (!sortConfig.key) return data;
  return [...data].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
}, [data, sortConfig]);

const handleSort = (key) => {
  setSortConfig({
    key,
    direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
  });
};

<Table>
  <TableHeader>
    <TableRow>
      <TableHead
        onClick={() => handleSort('name')}
        aria-sort={sortConfig.key === 'name' ? sortConfig.direction : 'none'}
      >
        Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
      </TableHead>
      <TableHead onClick={() => handleSort('value')}>
        Value
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {sortedData.map((row) => (
      <TableRow key={row.id}>
        <TableCell>{row.name}</TableCell>
        <TableCell>{row.value}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Filterable Table

```tsx
const [filters, setFilters] = useState({});
const [search, setSearch] = useState('');

const filteredData = useMemo(() => {
  return data.filter((row) => {
    const matchesSearch = row.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return row[key] === value;
    });
    return matchesSearch && matchesFilters;
  });
}, [data, search, filters]);

<Input
  placeholder="Search..."
  value={search}
  onChange={setSearch}
  aria-label="Search table"
/>

<Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
  <Select.Trigger>All Statuses</Select.Trigger>
  <Select.Content>
    <Select.Item value="active">Active</Select.Item>
    <Select.Item value="inactive">Inactive</Select.Item>
  </Select.Content>
</Select>
```

## Accessibility

### Screen Reader Support

```tsx
// Provide text alternative
<figure aria-label="Line chart showing revenue growth from January to March">
  <Chart />
  <figcaption>
    Revenue increased from $400 in January to $500 in March.
  </figcaption>
</figure>

// Accessible data table
<Table aria-label="Sales data by region">
  <Caption>Q1 2024 Sales by Region</Caption>
  ...
</Table>
```

### Keyboard Navigation

```tsx
// Make chart interactive elements focusable
<Bar
  ...
  tabIndex={0}
  aria-label={`${region}: $${value}`}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      showTooltip(region);
    }
  }}
/>
```

### Tooltip Accessibility

```tsx
// Ensure tooltip is keyboard accessible
<Tooltip>
  <Tooltip.Trigger>
    <Button aria-describedby="tooltip-1">Info</Button>
  </Tooltip.Trigger>
  <Tooltip.Content id="tooltip-1">
    This chart shows monthly revenue.
  </Tooltip.Content>
</Tooltip>
```

## Performance

### Large Datasets

```tsx
// Virtualize large lists
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={largeDataset}
  renderItem={renderItem}
  estimatedItemSize={50}
/>

// Downsample chart data
const downsample = (data, targetPoints) => {
  const step = Math.ceil(data.length / targetPoints);
  return data.filter((_, index) => index % step === 0);
};
```

### Lazy Loading

```tsx
const [chartData, setChartData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    const data = await fetchChartData();
    setChartData(data);
    setLoading(false);
  };
  loadData();
}, []);

if (loading) return <ChartSkeleton />;
<Chart data={chartData} />;
```

## Responsive Charts

```tsx
// Mobile: horizontal bar instead of vertical
const isMobile = useMediaQuery('(max-width: 768px)');

{isMobile ? (
  <BarChart layout="vertical" data={data}>
    <XAxis type="number" />
    <YAxis dataKey="name" type="category" width={100} />
  </BarChart>
) : (
  <BarChart data={data}>
    <XAxis dataKey="name" />
    <YAxis />
  </BarChart>
)}
```

## Checklist

- [ ] Chart type matches data type
- [ ] Colors are colorblind-safe
- [ ] Patterns supplement color
- [ ] All chart elements have 3:1 contrast
- [ ] Labels have 4.5:1 contrast
- [ ] Tooltips show exact values
- [ ] Screen reader text alternative provided
- [ ] Keyboard navigation works
- [ ] Responsive on mobile
- [ ] Empty state handled
- [ ] Loading state shown
- [ ] Error state handled
- [ ] Large datasets virtualized
