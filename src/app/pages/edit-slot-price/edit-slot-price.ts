import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from 'src/app/api.service';
import { NgxCustomModalComponent } from 'ngx-custom-modal';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-edit-slot-price',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, NgxCustomModalComponent],
  templateUrl: './edit-slot-price.html',
})
export class EditSlotPriceComponent implements OnInit {
  @ViewChild('editPriceModal') editPriceModal!: NgxCustomModalComponent;

  turfs: any[] = [];
  sports: any[] = [];
  slots: any[] = [];
  isLoading = false;

  selectedTurf: string = '';
  selectedSport: string = '';
  day = 'Monday';
  weekdays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  priceForm: FormGroup;
  selectedSlot: any = null;

  constructor(private apiService: ApiService, private fb: FormBuilder) {
    this.priceForm = this.fb.group({
      current_price: [{ value: '', disabled: true }],
      new_price: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadTurfs();
  }

  onTurfChange(turfId: string): void {
    this.selectedTurf = turfId;
    this.fetchSportsByTurf(turfId, true);
  }

  fetchSportsByTurf(turfId: string, resetSlots = false): void {
    if (!turfId) {
      this.sports = [];
      this.selectedSport = '';
      return;
    }

    this.apiService.getSportsByTurf(turfId).subscribe({
      next: (res: any) => {
        this.sports = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        if (this.sports.length === 1) {
          const sport = this.sports[0];
          this.selectedSport = sport.sport_id || sport.id || sport.sportId;
        } else {
          this.selectedSport = '';
        }

        if (resetSlots) this.loadSlots();
      },
      error: (err) => {
        console.error('Error fetching sports:', err);
        this.sports = [];
        this.selectedSport = '';
      }
    });
  }

  onSportChange(): void {
    this.loadSlots();
  }

  changeDay(d: string): void {
    if (this.day === d) return;
    this.day = d;
    this.loadSlots();
  }

  loadTurfs(): void {
    const ownerId = this.apiService.getOwnerId();
    if (!ownerId) return;

    this.apiService.getOwnerDetails(ownerId).subscribe({
      next: res => {
        this.turfs = Array.isArray(res?.data) ? res.data : [];
        if (this.turfs.length) {
          this.selectedTurf = this.turfs[0].turf_id;
          this.fetchSportsByTurf(this.selectedTurf, true);
        }
      },
      error: err => console.error('Error fetching turfs:', err)
    });
  }

  loadSlots(): void {
    if (!this.selectedTurf || !this.selectedSport) {
      this.slots = [];
      return;
    }

    this.isLoading = true;
    this.apiService.getSlotsByTurfSportDay(this.selectedTurf, this.selectedSport, this.day).subscribe({
      next: res => {
        this.slots = Array.isArray(res?.data) ? res.data : [];
        if (!this.slots.length) {
          this.isLoading = false;
          return;
        }

        const priceRequests = this.slots.map(slot => this.apiService.getSlotPriceById(slot.slot_id));
        forkJoin(priceRequests).subscribe({
          next: prices => {
            prices.forEach((priceData, index) => {
              // ✅ Correctly get price from priceData.data.price
              this.slots[index].price = priceData?.data?.price ?? 0;
            });
            this.isLoading = false;
          },
          error: err => {
            console.error('Error fetching slot prices:', err);
            this.isLoading = false;
          }
        });
      },
      error: err => {
        console.error('Error fetching slots:', err);
        this.isLoading = false;
      }
    });
  }

  openEditModal(slot: any): void {
    this.selectedSlot = slot;
    this.priceForm.patchValue({
      current_price: slot.price ?? 0,
      new_price: ''
    });
    this.editPriceModal.open();
  }

  savePrice(): void {
    if (this.priceForm.invalid || !this.selectedSlot?.slot_id) {
      this.priceForm.markAllAsTouched();
      return;
    }

    const updatedPrice = this.priceForm.get('new_price')?.value;
    this.apiService.updateSlotPrice(this.selectedSlot.slot_id, updatedPrice).subscribe({
      next: () => {
        this.selectedSlot.price = updatedPrice;
        this.editPriceModal.close();
      },
      error: err => console.error('Error updating price:', err)
    });
  } 

  changeStatus(slot: any, newStatus: 'Y' | 'N') {
    const previousStatus = slot.active_status;
    slot.active_status = newStatus;

    this.apiService.toggleSlotStatus(slot.slot_id, newStatus).subscribe({
      next: () => {},
      error: () => slot.active_status = previousStatus
    });
  }
}
