import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from 'src/app/api.service';
import { NgxCustomModalComponent } from 'ngx-custom-modal'; // Import the modal component
// Import the modules that provide the icons and modal component

@Component({
  selector: 'app-sport-master',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgxCustomModalComponent, // Import the modal component
    
  ],
  templateUrl: './sportsmaster.html',
  styleUrls: ['./sportsmaster.css']
})
export class SportMasterComponent implements OnInit {
  @ViewChild('addSportModal') addSportModal!: NgxCustomModalComponent;
  @ViewChild('viewTurfDetailsModal') viewTurfDetailsModal!: NgxCustomModalComponent;

  turfs: any[] = [];
  filteredTurfList: any[] = [];
  selectedTurfForDetails: any = null;

  availableSports = [
    { name: 'Cricket' },
    { name: 'Football' },
    { name: 'Tennis' },
    { name: 'Badminton' },
    { name: 'Hockey' },
    { name: 'Basketball' }
  ];

  sportForm: FormGroup;

  constructor(private apiService: ApiService, private fb: FormBuilder) {
    this.sportForm = this.fb.group({
      turf_id: ['', Validators.required],
      sport_name: ['', Validators.required],
      description: ['', Validators.required],
      is_active: ['Y'],
      created_by: ['owner01'],
    });
  }

  ngOnInit(): void {
    this.fetchTurfs();
  }

  fetchTurfs() {
    const ownerId = this.apiService.getOwnerId() || 'OWN001';
    this.apiService.getOwnerDetails(ownerId).subscribe((res: any) => {
      this.turfs = res.data || [];
      this.filteredTurfList = this.turfs;
    });
  }

  openAddSportModal() {
    this.sportForm.reset({
      is_active: 'Y',
      created_by: 'owner01',
    });
    this.addSportModal.open();
  }

  submitSport() {
    if (this.sportForm.invalid) {
      this.sportForm.markAllAsTouched();
      return;
    }

    const payload = this.sportForm.value;

    this.apiService.createSport(payload).subscribe({
      next: (res: any) => {
        console.log('Sport created:', res);
        alert(`✅ ${payload.sport_name} added successfully!`);
        this.addSportModal.close();
        this.fetchTurfs();
      },
      error: (err) => {
        console.error('Error creating sport:', err);
        alert('❌ Failed to add sport. Please try again.');
      }
    });
  }

  // New methods for turf-related actions
  viewTurfDetails(turf: any) {
    this.selectedTurfForDetails = turf;
    this.viewTurfDetailsModal.open();
  }

  editTurf(turf: any) {
    console.log('Editing turf:', turf);
    // Add logic for editing a turf here
  }

  deleteTurf(turf: any) {
    console.log('Deleting turf:', turf);
    // Add logic for deleting a turf here
  }
}