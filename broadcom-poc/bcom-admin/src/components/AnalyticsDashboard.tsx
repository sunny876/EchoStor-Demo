import React, { useState } from 'react';
import { PieChart, Pie, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Filter, Download, RefreshCw, Calendar, ChevronDown, Search, AlertCircle } from 'lucide-react';
import SummaryCard from './SummaryCard';
import { queryVolumeData, topQueriesData, feedbackData, hallucinations, knowledgeGaps } from '../data/dashboardData';

const COLORS = ['#E31B0C', '#666666'];

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Controls */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-semibold text-gray-900">Support Analytics Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="flex items-center border border-gray-300 rounded px-4 py-2 bg-white text-sm hover:bg-gray-50 transition-colors">
                <Calendar size={16} className="mr-2" />
                Last 7 Days
                <ChevronDown size={16} className="ml-2" />
              </button>
            </div>
            <button className="p-2 rounded hover:bg-gray-100 transition-colors">
              <RefreshCw size={18} />
            </button>
            <button className="flex items-center bg-[#E31B0C] text-white px-4 py-2 rounded text-sm hover:bg-[#cc1809] transition-colors">
              <Download size={16} className="mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard 
            title="Total Queries" 
            value="1,785" 
            change="+12.5%" 
            isPositive={true} 
          />
          <SummaryCard 
            title="Avg. Relevance Score" 
            value="0.61" 
            change="-0.05" 
            isPositive={false} 
          />
          <SummaryCard 
            title="Agent Handoffs" 
            value="406" 
            change="+8.2%" 
            isPositive={false} 
          />
          <SummaryCard 
            title="Hallucination Risk" 
            value="0.25" 
            change="-0.03" 
            isPositive={true} 
          />
        </div>
        
        {/* Knowledge Base Gap Analysis */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-medium mb-4">Knowledge Base Gap Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Relevance Score Distribution</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500">Average Search Result Relevance Score:</span>
                  <span className="text-sm font-medium">0.61</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500">Number of Queries with Low Relevance Score (&lt;0.2):</span>
                  <span className="text-sm font-medium">9</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500">Average Hallucination Risk Score:</span>
                  <span className="text-sm font-medium">0.25</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Number of Queries at Risk of Hallucination (&lt;0.1):</span>
                  <span className="text-sm font-medium">27</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Top Knowledge Gaps Detected</h3>
              <div className="overflow-y-auto max-h-[152px]">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Query Topic</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {knowledgeGaps.map(gap => (
                      <tr key={gap.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{gap.query}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{gap.count}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{gap.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Query Volume Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Query Volume & Handoffs</h2>
              <button className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors">
                <Filter size={14} className="mr-1" />
                Filter
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={queryVolumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="volume" stroke="#E31B0C" strokeWidth={2} name="Total Queries" />
                <Line type="monotone" dataKey="handoffs" stroke="#666666" strokeWidth={2} name="Agent Handoffs" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Top Queries Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Top Queries by Volume</h2>
              <button className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors">
                <Filter size={14} className="mr-1" />
                Filter
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topQueriesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="query" type="category" width={150} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#E31B0C" name="Query Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Additional Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Feedback Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">Feedback Distribution</h2>
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={feedbackData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {feedbackData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Hallucination Risk Monitor */}
          <div className="bg-white rounded-lg shadow-sm p-6 col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Hallucination Risk Monitor</h2>
              <div className="flex items-center">
                <AlertCircle size={16} className="text-[#E31B0C] mr-1" />
                <span className="text-sm text-[#E31B0C]">4 High Risk Responses</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Query</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {hallucinations.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.query}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.risk === 'High' ? 'bg-red-100 text-[#E31B0C]' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.risk}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.score}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Detailed Query Analysis */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Knowledge Base Gap Analysis Details</h2>
            <div className="relative">
              <input
                type="text"
                className="border border-gray-300 rounded pl-8 pr-3 py-2 text-sm"
                placeholder="Search queries..."
              />
              <Search size={16} className="absolute left-2.5 top-2.5 text-gray-400" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Query</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Search Relevance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hallucination Risk</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">How do I set up RADIUS authentication with AAM 2.0?</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">0.15</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">0.68</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-[#E31B0C]">
                      Critical Gap
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-[#E31B0C] hover:underline cursor-pointer">Create Content</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">VMware vSphere license activation process</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">0.22</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">0.48</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      Content Gap
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-[#E31B0C] hover:underline cursor-pointer">Create Content</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Find me the most relevant content for building DIY</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">0.05</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">0.82</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-[#E31B0C]">
                      Critical Gap
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-[#E31B0C] hover:underline cursor-pointer">Create Content</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Carbon Black App Control installation verification</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">0.18</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">0.55</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      Content Gap
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-[#E31B0C] hover:underline cursor-pointer">Create Content</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">Showing 4 of 9 gaps</div>
            <div className="flex">
              <button className="px-3 py-1 border border-gray-300 bg-white text-gray-500 text-sm rounded-l hover:bg-gray-50 transition-colors">Previous</button>
              <button className="px-3 py-1 border border-gray-300 bg-white text-gray-500 text-sm rounded-r hover:bg-gray-50 transition-colors">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}