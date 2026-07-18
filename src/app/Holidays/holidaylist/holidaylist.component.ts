import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from '../../../environment/environment';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { DashboardServiceService } from '../../dashboard/dashboard-service.service';
import { holiday } from '../../dashboard/model/AggregateStudentView';

@Component({
  selector: 'app-holidaylist',
 imports: [
    CommonModule
  ],
  templateUrl: './holidaylist.component.html',
  styleUrl: './holidaylist.component.scss'
})
export class HolidaylistComponent {
  displayedColumns: string[] = ['avatar', 'name', 'gender', 'class'];
  dataSource = new MatTableDataSource<holiday>();

  constructor(private dashboardService: DashboardServiceService, private location : Location, private router:Router,
    private authService : AuthService
  ) {}

  ngOnInit(): void {
   this.dashboardService.getHolidayList().subscribe((holidayList : holiday[]) => {
      this.dataSource.data = holidayList;
   });
  }
  environment = environment;
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  goBack():void{
    this.location.back();
  }
  addNewStudent():void{
    this.router.navigate(['/students/register']);
  }
  markAttendance():void{
     this.router.navigate(['/students/attendance']);
  }
  gotoDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  getHolidayIcon(desc: string): string {
  const lower = desc.toLowerCase();
  if (/diwali/.test(lower)) return '🪔';
  if (/christmas/.test(lower)) return '🎄';
  if (/gandhi|republic|independence/.test(lower)) return '🇮🇳';
  if (/holi/.test(lower)) return '🌈';
  if (/eid/.test(lower)) return '🕌';
  return desc[0].toUpperCase();
}

  /* ---------- Month calendar ---------- */
  selectedMonth: Date = new Date();
  weekDayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  get monthTabs(): { label: string; date: Date }[] {
    const base = new Date();
    return [-1, 0, 1].map(offset => {
      const d = new Date(base.getFullYear(), base.getMonth() + offset, 1);
      return { label: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), date: d };
    });
  }

  isSameMonth(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
  }

  setMonth(date: Date): void {
    this.selectedMonth = date;
  }

  get monthLabel(): string {
    return this.selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  private holidayDatesInSelectedMonth(): Date[] {
    return this.dataSource.data
      .map(h => new Date(h.holidayDate))
      .filter(d => this.isSameMonth(d, this.selectedMonth));
  }

  get monthHolidayCount(): number {
    return this.holidayDatesInSelectedMonth().length;
  }

  get calendarCells(): { date: number; inMonth: boolean; isToday: boolean; isHoliday: boolean }[] {
    const year = this.selectedMonth.getFullYear();
    const month = this.selectedMonth.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    const holidayDays = this.holidayDatesInSelectedMonth().map(d => d.getDate());

    const cells: { date: number; inMonth: boolean; isToday: boolean; isHoliday: boolean }[] = [];

    for (let i = startOffset - 1; i >= 0; i--) {
      cells.push({ date: daysInPrevMonth - i, inMonth: false, isToday: false, isHoliday: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        date: d,
        inMonth: true,
        isToday: d === today.getDate() && month === today.getMonth() && year === today.getFullYear(),
        isHoliday: holidayDays.includes(d)
      });
    }
    let nextDay = 1;
    while (cells.length % 7 !== 0) {
      cells.push({ date: nextDay++, inMonth: false, isToday: false, isHoliday: false });
    }
    return cells;
  }

  get upcomingHolidays(): holiday[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.dataSource.filteredData
      .filter(h => new Date(h.holidayDate) >= today)
      .sort((a, b) => new Date(a.holidayDate).getTime() - new Date(b.holidayDate).getTime());
  }
}
