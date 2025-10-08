import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
  AbstractControl
} from '@angular/forms';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-slot-generator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './slotmaster.html',
})
export class SlotGeneratorComponent implements OnInit {
  slotForm: FormGroup;
  turfs: any[] = [];
  sports: any[] = [];
  allDays: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.slotForm = this.fb.group({
      turf_id: ['', Validators.required],
      sport_id: ['', Validators.required],
      global_start_date: ['', Validators.required],
      global_end_date: ['', Validators.required],
      global_buffer_minutes: [10, [Validators.required, Validators.pattern('^[0-9]+$')]],
      days: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.allDays.forEach(day => this.daysFormArray.push(this.createDayFormGroup(day)));
    this.fetchTurfs();
    this.slotForm.get('turf_id')?.valueChanges.subscribe(turfId => this.fetchSportsByTurf(turfId));
  }

  // -------------------------
  // Fetch turfs & sports
  // -------------------------
  fetchTurfs(): void {
    const ownerId = this.apiService.getOwnerId() || 'OWN001';
    this.apiService.getOwnerDetails(ownerId).subscribe({
      next: (res: any) => {
        this.turfs = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      },
      error: (err) => console.error('Error fetching turfs:', err)
    });
  }

  fetchSportsByTurf(turfId: string): void {
    if (!turfId) { this.sports = []; this.slotForm.patchValue({ sport_id: '' }); return; }
    this.apiService.getSportsByTurf(turfId).subscribe({
      next: (res: any) => {
        this.sports = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        if (this.sports.length === 1) {
          const sport = this.sports[0];
          const sportId = sport.sport_id || sport.id || sport.sportId;
          this.slotForm.patchValue({ sport_id: sportId });
        } else { this.slotForm.patchValue({ sport_id: '' }); }
      },
      error: (err) => console.error('Error fetching sports:', err)
    });
  }

  // -------------------------
  // FormArray helpers
  // -------------------------
  get daysFormArray() { return this.slotForm.get('days') as FormArray; }

  getDayFormGroup(control: AbstractControl): FormGroup { return control as FormGroup; }

  createDayFormGroup(day: string): FormGroup {
    const dayGroup = this.fb.group({
      day: [day],
      price: [500, [Validators.required, Validators.pattern('^[0-9]+$')]],
      slot_duration: [60, [Validators.required, Validators.pattern('^[0-9]+$')]], // per-day slot duration
      timeRanges: this.fb.array([this.createTimeRangeFormGroup()])
    });

    this.getTimeRangesFormArray(dayGroup).valueChanges.subscribe(() => {
      this.generateDaySlots(dayGroup);
    });

    return dayGroup;
  }

  createTimeRangeFormGroup(): FormGroup {
    return this.fb.group({
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      generatedSlots: [[]]
    });
  }

  getTimeRangesFormArray(dayGroup: AbstractControl): FormArray {
    return dayGroup.get('timeRanges') as FormArray;
  }

  addTimeRange(dayGroup: AbstractControl): void {
    this.getTimeRangesFormArray(dayGroup).push(this.createTimeRangeFormGroup());
  }

  removeTimeRange(dayGroup: AbstractControl, index: number): void {
    const timeRangesArray = this.getTimeRangesFormArray(dayGroup);
    if (timeRangesArray.length > 1) timeRangesArray.removeAt(index);
  }

  // -------------------------
  // Slot generation
  // -------------------------
  generateDaySlots(dayGroup: AbstractControl): void {
    const timeRangesArray = this.getTimeRangesFormArray(dayGroup);
    const globalBufferMinutes = this.slotForm.get('global_buffer_minutes')?.value || 0;
    const slotDurationMinutes = dayGroup.get('slot_duration')?.value || 60;

    timeRangesArray.controls.forEach(timeRangeGroup => {
      const startTimeStr = timeRangeGroup.get('start_time')?.value;
      const endTimeStr = timeRangeGroup.get('end_time')?.value;
      const generatedSlots: string[] = [];

      if (startTimeStr && endTimeStr) {
        let current = this.timeToDate(startTimeStr);
        const end = this.timeToDate(endTimeStr);

        while (current.getTime() < end.getTime()) {
          const slotEnd = new Date(current.getTime() + slotDurationMinutes * 60 * 1000);
          if (slotEnd.getTime() > end.getTime()) break;
          generatedSlots.push(this.formatTime(current));
          current = new Date(slotEnd.getTime() + globalBufferMinutes * 60 * 1000);
        }
      }

      timeRangeGroup.get('generatedSlots')?.setValue(generatedSlots);
    });
  }

  private timeToDate(timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // -------------------------
  // Copy previous day data
  // -------------------------
  copyPreviousDay(dayIndex: number) {
    if (dayIndex === 0) return; // no previous day
    const prevDay = this.daysFormArray.at(dayIndex - 1);
    const currentDay = this.daysFormArray.at(dayIndex);

    // Copy price & slot_duration
    currentDay.get('price')?.setValue(prevDay.get('price')?.value);
    currentDay.get('slot_duration')?.setValue(prevDay.get('slot_duration')?.value);

    // Copy time ranges
    const prevTR = this.getTimeRangesFormArray(prevDay);
    const currentTR = this.getTimeRangesFormArray(currentDay);
    currentTR.clear();
    prevTR.controls.forEach(rangeGroup => {
      const newRange = this.fb.group({
        start_time: rangeGroup.get('start_time')?.value,
        end_time: rangeGroup.get('end_time')?.value,
        generatedSlots: []
      });
      currentTR.push(newRange);
    });

    // regenerate slots
    this.generateDaySlots(currentDay);
  }

  // -------------------------
  // Save slots
  // -------------------------
  generateSlots(): void {
    this.slotForm.markAllAsTouched();
    if (!this.slotForm.valid) { console.error('Form invalid'); return; }

    const formValue = this.slotForm.getRawValue();
    formValue.days.forEach((dayConfig: any) => {
      dayConfig.timeRanges.forEach((range: any) => {
        const generated = range.generatedSlots || [];
        const slotsPayload: { start_time: string; end_time: string }[] = [];

        for (let i = 0; i < generated.length; i++) {
          const start_time = generated[i];
          const end_time = (i + 1 < generated.length) ? generated[i + 1] : range.end_time;
          slotsPayload.push({ start_time, end_time });
        }

        const payload = {
          turf_id: formValue.turf_id,
          sport_id: formValue.sport_id,
          day: dayConfig.day,
          start_date: formValue.global_start_date,
          end_date: formValue.global_end_date,
          start_time: range.start_time,
          end_time: range.end_time,
          slot_duration: dayConfig.slot_duration,
          slots: slotsPayload,
          price: dayConfig.price
        };

        this.apiService.saveSlots(payload).subscribe({
          next: (res) => console.log(`✅ Slots saved for ${dayConfig.day}`, res),
          error: (err) => console.error(`❌ Error saving slots for ${dayConfig.day}`, err)
        });
      });
    });

    alert('Slots submitted! ✅');
    this.slotForm.reset({ global_buffer_minutes: 10 });
    this.daysFormArray.clear();
    this.allDays.forEach(day => this.daysFormArray.push(this.createDayFormGroup(day)));
  }
}
