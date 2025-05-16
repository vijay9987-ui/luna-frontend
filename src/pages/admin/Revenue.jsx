// src/pages/admin/Revenue.jsx
import { useState } from 'react';

const Revenue = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
  });

  const revenueData = [
    { date: '2023-05-01', revenue: 1200, orders: 24 },
    { date: '2023-05-02', revenue: 1900, orders: 38 },
    // ... more data
  ];

  const categoryData = [
    { name: 'Electronics', value: 45 },
    { name: 'Clothing', value: 30 },
    { name: 'Home', value: 15 },
    { name: 'Other', value: 10 },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">Revenue Analytics</h1>
        <div className="d-flex gap-2">
          <input 
            type="date" 
            className="form-control"
            value={dateRange.startDate.toISOString().split('T')[0]}
            onChange={(e) => setDateRange({...dateRange, startDate: new Date(e.target.value)})}
          />
          <span className="align-self-center">to</span>
          <input 
            type="date" 
            className="form-control"
            value={dateRange.endDate.toISOString().split('T')[0]}
            onChange={(e) => setDateRange({...dateRange, endDate: new Date(e.target.value)})}
          />
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-8 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Revenue Trend</h5>
              <div className="bg-light p-4 text-center">
                <p>Line chart would be displayed here</p><img src='#'
                className='img-fluid'/>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Revenue by Category</h5>
              <div className="bg-light p-4 text-center">
              <img src='#'
                className='img-fluid'/>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Detailed Revenue Report</h5>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                  <th>Avg. Order Value</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.date}</td>
                    <td>{item.orders}</td>
                    <td>${item.revenue.toFixed(2)}</td>
                    <td>${(item.revenue / item.orders).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Revenue;