'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AnalyticsData } from '../../../lib/types';
import { Activity } from 'lucide-react';

interface AnalyticsChartsProps {
    analytics?: AnalyticsData;
    dailyFilter: string;
    monthlyFilter: string;
    onDailyFilterChange: (filter: string) => void;
    onMonthlyFilterChange: (filter: string) => void;
    isUpdating: boolean;
}

export default function AnalyticsCharts({ 
    analytics, 
    dailyFilter, 
    monthlyFilter, 
    onDailyFilterChange, 
    onMonthlyFilterChange, 
    isUpdating 
}: AnalyticsChartsProps) {
    if (!analytics) return null;

    const DAILY_FILTERS = [
        { value: '7d', label: '7 Hari' },
        { value: '1m', label: '1 Bulan' },
    ];

    const MONTHLY_FILTERS = [
        { value: '3m', label: '3 Bulan' },
        { value: '6m', label: '6 Bulan' },
        { value: '1y', label: '1 Tahun' },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Activity className="w-7 h-7 text-[#085C3B]" />
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            Analitik Scan & Check-in
                            {isUpdating && (
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                            )}
                        </h3>
                        <p className="text-sm text-gray-500">Statistik pengunjung yang sudah melakukan scan (Live)</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                {/* DAILY CHART */}
                <div className="p-6">
                    <div className="flex flex-row items-center justify-between mb-6 gap-2">
                        <h4 className="text-sm font-bold text-gray-900">
                            Scan / Check-in Harian
                        </h4>
                        <select 
                            value={dailyFilter}
                            onChange={(e) => onDailyFilterChange(e.target.value)}
                            disabled={isUpdating}
                            className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                        >
                            {DAILY_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={analytics.daily}
                                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{ fontSize: 12, fill: '#6B7280' }} 
                                    tickFormatter={(val) => {
                                        const d = new Date(val);
                                        return `${d.getDate()}/${d.getMonth()+1}`;
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis 
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    labelStyle={{ fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}
                                    labelFormatter={(label: any) => {
                                        if (!label) return '';
                                        const d = new Date(String(label));
                                        return d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                                <Line type="monotone" name="Orang" dataKey="people" stroke="#085C3B" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" name="Tiket" dataKey="tickets" stroke="#D29C29" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* MONTHLY CHART */}
                <div className="p-6">
                    <div className="flex flex-row items-center justify-between mb-6 gap-2">
                        <h4 className="text-sm font-bold text-gray-900">
                            Scan / Check-in Bulanan
                        </h4>
                        <select 
                            value={monthlyFilter}
                            onChange={(e) => onMonthlyFilterChange(e.target.value)}
                            disabled={isUpdating}
                            className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                        >
                            {MONTHLY_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={analytics.monthly}
                                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis 
                                    dataKey="month" 
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                    tickFormatter={(val) => {
                                        const [year, month] = val.split('-');
                                        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
                                        return date.toLocaleDateString('id-ID', { month: 'short' });
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis 
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip 
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    labelStyle={{ fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}
                                    labelFormatter={(label: any) => {
                                        if (!label) return '';
                                        const [year, month] = String(label).split('-');
                                        const d = new Date(parseInt(year), parseInt(month) - 1, 1);
                                        return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                                <Bar name="Orang" dataKey="people" fill="#085C3B" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                <Bar name="Tiket" dataKey="tickets" fill="#D29C29" radius={[4, 4, 0, 0]} maxBarSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
