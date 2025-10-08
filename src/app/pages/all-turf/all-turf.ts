import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/api.service';
import { NgxCustomModalComponent } from 'ngx-custom-modal';
@Component({
  selector: 'app-all-turf',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxCustomModalComponent],
  templateUrl: './all-turf.html',
})
export class AllTurfComponent implements OnInit {
  @ViewChild('turfDetailsModal') turfDetailsModal!: NgxCustomModalComponent;

  turfs: any[] = [];
  filteredTurfs: any[] = []; 
  loading = true;
  turfSearch: string = '';
  selectedTurf: any = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchTurfs();
  }

  /** ✅ Fetch turf list from API */
  fetchTurfs(): void {
    const ownerId = this.apiService.getOwnerId();
    if (!ownerId) {
      console.error('No owner ID found in local storage');
      this.loading = false;
      return;
    }

    this.apiService.getOwnerDetails(ownerId).subscribe({
      next: (res) => {
        this.turfs = res.turfs || res.data || [];
        this.filteredTurfs = this.turfs;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching turfs:', err);
        this.loading = false;
      }
    });
  }

  /** ✅ Search turf dynamically */
  searchTurfs(): void {
    const query = this.turfSearch.toLowerCase();
    this.filteredTurfs = this.turfs.filter(turf =>
      turf.turf_name.toLowerCase().includes(query) ||
      (turf.address && turf.address.toLowerCase().includes(query)) ||
      (turf.city && turf.city.toLowerCase().includes(query)) ||
      (turf.state && turf.state.toLowerCase().includes(query)) ||
      (turf.pincode && turf.pincode.toString().includes(query))
    );
  }

  /** ✅ Open turf details modal */
  viewTurfDetails(turf: any): void {
    this.selectedTurf = turf;
    this.turfDetailsModal.open();
  }

  /** ✅ Close turf details modal */
  closeTurfDetails(): void {
    this.turfDetailsModal.close();
    this.selectedTurf = null;
  }
}