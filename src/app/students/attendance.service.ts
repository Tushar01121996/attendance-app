import { Injectable } from '@angular/core';
import { AttendanceRecord } from './model/attendance'; 

const STORAGE_KEY = 'attendance_records_v1';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private getAll(): AttendanceRecord[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private saveAll(arr: AttendanceRecord[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  /**
   * Save bulk: existing records for same date/class/section will be replaced
   */
  saveBulk(records: AttendanceRecord[]) {
    const all = this.getAll();
    if (!records || !records.length) return;

    const date = records[0].date;
    const className = records[0].className;
    const section = records[0].section;

    // remove existing for same date/class/section
    const filtered = all.filter(r => !(r.date === date && r.className === className && r.section === section));
    const merged = [...filtered, ...records];
    this.saveAll(merged);
  }

  getByDateClassSection(date: string, className: string, section?: string): AttendanceRecord[] {
    return this.getAll().filter(r => r.date === date && r.className === className && (section ? r.section === section : true));
  }

  exportAll(): AttendanceRecord[] {
    return this.getAll();
  }

  clearAll() {
    localStorage.removeItem(STORAGE_KEY);
  }
}
