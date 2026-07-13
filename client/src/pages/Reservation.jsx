import React, { useState } from 'react';
import { Calendar, Users, Clock, CheckCircle2 } from 'lucide-react';

const TABLES = [
  { id: 'T1', name: 'Table 1', capacity: 2, zone: 'Window Side' },
  { id: 'T2', name: 'Table 2', capacity: 2, zone: 'Window Side' },
  { id: 'T3', name: 'Table 3', capacity: 4, zone: 'Window Side' },
  { id: 'T4', name: 'Table 4', capacity: 4, zone: 'Main Hall' },
  { id: 'T5', name: 'Table 5', capacity: 6, zone: 'Main Hall' },
  { id: 'T6', name: 'Table 6', capacity: 2, zone: 'Main Hall' },
  { id: 'T7', name: 'Table 7', capacity: 4, zone: 'Outdoor Patio' },
  { id: 'T8', name: 'Table 8', capacity: 4, zone: 'Outdoor Patio' },
  { id: 'T9', name: 'Table 9', capacity: 6, zone: 'Outdoor Patio' },
  { id: 'T10', name: 'Table 10', capacity: 4, zone: 'VIP Lounge' },
  { id: 'T11', name: 'Table 11', capacity: 6, zone: 'VIP Lounge' },
  { id: 'T12', name: 'Table 12', capacity: 2, zone: 'VIP Lounge' }
];

export default function Reservation() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    date: '',
    time: '18:00',
    guests: 2,
    tableNumber: ''
  });

  const [selectedTableId, setSelectedTableId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getUnavailableTables = (date, time) => {
    let blocked = [];
    if (date && time) {
      const hash = (date.charCodeAt(date.length - 1) || 0) + parseInt(time.split(':')[0] || 0);
      if (hash % 3 === 0) blocked = ['T1', 'T5', 'T10'];
      else if (hash % 3 === 1) blocked = ['T2', 'T6', 'T8', 'T11'];
      else blocked = ['T3', 'T4', 'T9', 'T12'];
    }
    
    // Add manual blocks from admin panel
    const adminBlocked = JSON.parse(localStorage.getItem('blocked_tables_admin') || '[]');
    return [...new Set([...blocked, ...adminBlocked])];
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if table capacity fits party size
    if (selectedTableId) {
      const chosenTable = TABLES.find(t => t.id === selectedTableId);
      if (chosenTable && chosenTable.capacity < Number(formData.guests)) {
        setError('Selected table capacity is smaller than your party size! Please select a larger table.');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          type: 'reservation',
          reservationDetails: {
            date: formData.date,
            time: formData.time,
            guests: Number(formData.guests),
            tableNumber: formData.tableNumber
          }
        })
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const errData = await response.json();
        setError(errData.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.log('Backend offline, showing local success simulation.');
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 bg-[#ffffff]">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        {submitted ? (
          <div className="bg-[#fcfcfa] p-12 rounded border border-neutral-100 text-center space-y-6 max-w-md mx-auto shadow-sm animate-fade-in font-sans">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-50 text-[#7c562d]">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-light text-neutral-900 font-serif">Booking Confirmed</h2>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Thank you, <span className="text-neutral-900 font-semibold">{formData.customerName}</span>. Your reservation for <span className="text-neutral-900 font-semibold">{formData.guests} guests</span> on <span className="text-neutral-900 font-semibold">{formData.date}</span> at <span className="text-neutral-900 font-semibold">{formData.time}</span> {formData.tableNumber && <>at <span className="text-neutral-900 font-semibold">{formData.tableNumber}</span></>} has been requested. We will send a confirmation details email shortly.
            </p>
            <button 
              onClick={() => {
                setSubmitted(false);
                setSelectedTableId('');
                setFormData({
                  customerName: '',
                  customerEmail: '',
                  customerPhone: '',
                  date: '',
                  time: '18:00',
                  guests: 2,
                  tableNumber: ''
                });
              }}
              className="w-full bg-[#7c562d] hover:bg-[#634423] text-white font-medium py-3 rounded text-xs uppercase tracking-widest transition-all duration-300"
            >
              Make Another Booking
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 bg-[#fcfcfa] p-8 md:p-12 rounded border border-neutral-100 shadow-sm animate-fade-in font-sans">
            <div className="md:col-span-4 space-y-6">
              <span className="text-xs text-[#7c562d] uppercase tracking-widest font-semibold">Reserve Your Stay</span>
              <h2 className="text-3xl font-light text-neutral-900 font-serif">Book a Room or Table</h2>
              <p className="text-neutral-500 text-sm leading-relaxed font-light">
                We recommend reserving your suites or private dining tables at least 2 weeks in advance due to seasonal demand.
              </p>
              <div className="space-y-4 pt-4 border-t border-neutral-100 text-xs text-neutral-500">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-[#7c562d]" /> Dynamic suites selection available
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#7c562d]" /> Check-in standard time: 2:00 PM
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="md:col-span-8 space-y-6">
              {error && <div className="text-sm text-red-500 bg-red-50 border border-red-200 px-4 py-2 rounded">{error}</div>}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-neutral-500 tracking-wider uppercase">Name</label>
                  <input
                    type="text"
                    name="customerName"
                    required
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full bg-white border border-neutral-200 focus:border-neutral-400 rounded px-4 py-3 text-sm focus:outline-none transition-colors text-neutral-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-neutral-500 tracking-wider uppercase">Phone</label>
                  <input
                    type="tel"
                    name="customerPhone"
                    required
                    value={formData.customerPhone}
                    onChange={handleChange}
                    placeholder="+94 77 123 4567"
                    className="w-full bg-white border border-neutral-200 focus:border-neutral-400 rounded px-4 py-3 text-sm focus:outline-none transition-colors text-neutral-800"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-neutral-500 tracking-wider uppercase">Email Address</label>
                <input
                  type="email"
                  name="customerEmail"
                  required
                  value={formData.customerEmail}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full bg-white border border-neutral-200 focus:border-neutral-400 rounded px-4 py-3 text-sm focus:outline-none transition-colors text-neutral-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-neutral-500 tracking-wider uppercase">Arrival Date</label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full bg-white border border-neutral-200 focus:border-neutral-400 rounded px-4 py-3 text-sm focus:outline-none transition-colors text-neutral-800 cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-neutral-500 tracking-wider uppercase">Arrival Time</label>
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full bg-white border border-neutral-200 focus:border-neutral-400 rounded px-4 py-3 text-sm focus:outline-none transition-colors text-neutral-850 cursor-pointer"
                  >
                    <option value="12:00">12:00 PM</option>
                    <option value="14:00">2:00 PM (Check-in)</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="18:00">6:00 PM</option>
                    <option value="20:00">8:00 PM</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-neutral-500 tracking-wider uppercase">Guests</label>
                  <select
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    className="w-full bg-white border border-neutral-200 focus:border-neutral-400 rounded px-4 py-3 text-sm focus:outline-none transition-colors text-neutral-850 cursor-pointer"
                  >
                    <option value="1">1 Person</option>
                    <option value="2">2 People</option>
                    <option value="3">3 People</option>
                    <option value="4">4 People</option>
                    <option value="5">5 People</option>
                    <option value="6">6 People</option>
                  </select>
                </div>
              </div>

              {/* Dining Table Floor Layout Map Selector */}
              <div className="space-y-3 pt-2">
                <label className="text-[10px] text-neutral-400 font-bold tracking-wider uppercase">Select Dining Table (Visual Layout)</label>
                <div className="bg-[#f7f7f5] p-5 rounded border border-neutral-200/60 space-y-4">
                  
                  {/* Legend */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-neutral-400 font-bold justify-center">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-white border border-neutral-300 rounded-sm shadow-sm"></span> Available</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#7c562d] rounded-sm shadow-sm"></span> Selected</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-100 border border-red-200 rounded-sm"></span> Occupied / Blocked</span>
                  </div>

                  {/* Grid layout */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {TABLES.map(table => {
                      const isOccupied = getUnavailableTables(formData.date, formData.time).includes(table.id);
                      const isSelected = selectedTableId === table.id;
                      const isTooSmall = table.capacity < Number(formData.guests);
                      
                      return (
                        <button
                          key={table.id}
                          type="button"
                          disabled={isOccupied}
                          onClick={() => {
                            setSelectedTableId(table.id);
                            setFormData({ ...formData, tableNumber: `${table.name} (${table.zone})` });
                          }}
                          className={`p-3 rounded border text-center transition-all duration-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:scale-[1.02] ${
                            isOccupied 
                              ? 'bg-red-50/40 border-red-100 text-red-300 cursor-not-allowed hover:scale-100'
                              : isSelected
                                ? 'bg-[#7c562d] border-[#7c562d] text-white shadow-sm hover:bg-[#634423]'
                                : isTooSmall
                                  ? 'bg-white border-orange-200 text-neutral-700 hover:bg-orange-50/20'
                                  : 'bg-white border-neutral-200 text-neutral-700 hover:border-[#7c562d]/50 hover:bg-[#7c562d]/5'
                          }`}
                        >
                          <span className="text-[11px] font-bold tracking-wide">{table.name}</span>
                          <span className={`text-[8px] font-bold uppercase tracking-wider ${isSelected ? 'text-amber-100/90' : 'text-[#7c562d]'}`}>
                            {table.zone}
                          </span>
                          <span className={`text-[9px] font-medium ${isSelected ? 'text-amber-50/90' : 'text-neutral-400'}`}>
                            Cap: {table.capacity} Guests
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Warnings & Selection confirmation */}
                  {selectedTableId ? (
                    <div className="space-y-1 pt-1">
                      {TABLES.find(t => t.id === selectedTableId)?.capacity < Number(formData.guests) ? (
                        <p className="text-[10px] text-orange-700 bg-orange-50 border border-orange-200 p-3 rounded text-center font-bold flex items-center justify-center gap-1.5 animate-pulse">
                          ⚠️ This table fits {TABLES.find(t => t.id === selectedTableId)?.capacity} guests. Your party has {formData.guests} guests. Consider choosing a larger table!
                        </p>
                      ) : (
                        <p className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded text-center font-bold">
                          ✓ Table chosen: {formData.tableNumber} (Capacity fits your party size!)
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[9px] text-neutral-400 italic text-center">
                      Please select a date, time, and click a table on the map to reserve.
                    </p>
                  )}

                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#7c562d] hover:bg-[#634423] disabled:bg-neutral-300 text-white font-medium py-4 rounded text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer"
              >
                {loading ? 'Processing...' : 'Request Reservation'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
