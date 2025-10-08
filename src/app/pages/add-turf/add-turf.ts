import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { ApiService } from 'src/app/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-turf',
  templateUrl: './add-turf.html',
  
})
export class AddTurfComponent implements OnInit {
  turfForm!: FormGroup;
  selectedFileName: string = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const ownerId = this.apiService.getOwnerId();

    if (!ownerId) {
      console.error('❌ Owner ID not found in local storage.');
      alert('Owner ID not found. Please log in again.');
      this.router.navigate(['/login']);
      this.initForm(null);
      return;
    }

    this.initForm(ownerId);
  }

  /** Initialize form */
  private initForm(ownerId: string | null) {
    this.turfForm = this.fb.group({
      owner_id: [ownerId, Validators.required],
      turf_name: ['', [Validators.required, Validators.maxLength(100)]],
      address: ['', [Validators.required, Validators.maxLength(250)]],
      map_link: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(https?:\/\/)?(www\.)?google\.[a-z.]+\/maps\/.+$/)
        ]
      ],
      city: ['', [Validators.required, Validators.maxLength(50)]],
      state: ['', [Validators.required, Validators.maxLength(50)]],
      pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      opening_time: ['', Validators.required],
      closing_time: ['', Validators.required],

      // ✅ NEW FIELDS
      slot_duration: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      buffer_minutes: ['', [Validators.required, Validators.pattern(/^\d+$/)]],

      turf_image: [null, Validators.required],
      amenities: this.fb.array([], Validators.minLength(1))
    });
  }

  /** Getter for amenities FormArray */
  get amenities(): FormArray {
    return this.turfForm.get('amenities') as FormArray;
  }

  /** Handle file selection for turf image */
  onFileSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      this.turfForm.patchValue({
        turf_image: file
      });
      this.turfForm.get('turf_image')?.markAsTouched();
      this.turfForm.get('turf_image')?.updateValueAndValidity();
      this.selectedFileName = file.name;
    } else {
      this.turfForm.patchValue({
        turf_image: null
      });
      this.selectedFileName = '';
    }
  }

  /** Add amenity */
  addAmenity(value: string) {
    const trimmed = value.trim();
    if (trimmed) {
      this.amenities.push(this.fb.control(trimmed, Validators.required));
      this.amenities.markAsDirty();
      this.amenities.updateValueAndValidity();
    }
  }

  /** Remove amenity */
  removeAmenity(index: number) {
    this.amenities.removeAt(index);
    this.amenities.markAsDirty();
    this.amenities.updateValueAndValidity();
  }

  /** Submit form */
  submitTurf() {
    if (this.turfForm.invalid) {
      this.markAllTouched(this.turfForm);
      console.warn('⚠️ Form invalid', this.turfForm.value);
      return;
    }

    const formData = new FormData();
    const ownerId = this.turfForm.get('owner_id')?.value;

    if (!ownerId) {
      alert('❌ Owner ID not found. Please log in again.');
      this.router.navigate(['/login']);
      return;
    }

    formData.append('owner_id', ownerId);

    Object.keys(this.turfForm.controls).forEach(key => {
      const control = this.turfForm.get(key);
      if (control && key !== 'owner_id') {
        if (key === 'amenities') {
          (control.value as string[]).forEach((amenity: string) => {
            formData.append('amenities[]', amenity);
          });
        } else if (key === 'turf_image' && control.value) {
          formData.append('image', control.value, control.value.name);
        } else {
          formData.append(key, control.value);
        }
      }
    });

    this.apiService.createTurf(formData).subscribe({
      next: (res) => {
        console.log('✅ Turf Created Successfully', res);
        alert('Turf created successfully!');
        this.router.navigate(['/turf-list']);
      },
      error: (err) => console.error('❌ Error creating turf', err)
    });
  }

  /** Mark all controls as touched */
  private markAllTouched(control: AbstractControl) {
    if (control instanceof FormGroup || control instanceof FormArray) {
      Object.values(control.controls).forEach(c => this.markAllTouched(c));
    }
    control.markAsTouched();
  }
}
