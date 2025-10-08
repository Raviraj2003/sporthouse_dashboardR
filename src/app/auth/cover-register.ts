import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { toggleAnimation } from 'src/app/shared/animations';
import { AppService } from 'src/app/service/app.service';
import { ApiService } from '../api.service';  // ✅ API service

@Component({
  selector: 'app-cover-register',
  templateUrl: './cover-register.html',
  animations: [toggleAnimation],
})
export class CoverRegisterComponent {
  store: any;
  currYear: number = new Date().getFullYear();

  // ✅ form data object for [(ngModel)]
  registerData = {
    owner_name: '',
    email: '',
    phone_no: '',
    password: ''
  };

  constructor(
    public translate: TranslateService,   // ✅ must be public (used in template)
    private storeData: Store<any>,
    private router: Router,
    private appSetting: AppService,
    private apiService: ApiService
  ) {
    this.initStore();
  }

  /** ✅ Store setup */
  initStore(): void {
    this.storeData
      .select((state) => state.index)
      .subscribe((data) => {
        this.store = data;
      });
  }

  /** ✅ Change language */
  changeLanguage(item: any): void {
    this.translate.use(item.code);
    this.appSetting.toggleLanguage(item);

    if (this.store?.locale?.toLowerCase() === 'ae') {
      this.storeData.dispatch({ type: 'toggleRTL', payload: 'rtl' });
    } else {
      this.storeData.dispatch({ type: 'toggleRTL', payload: 'ltr' });
    }

    window.location.reload();
  }

  /** ✅ Triggered when form submitted */
  onRegister(): void {
    this.apiService.register(this.registerData).subscribe({
      next: (res: any) => {
        console.log('Register success:', res);

        // ✅ Display backend response message
        if (res && res.message) {
          window.alert(res.message); // e.g. "Turf Owner registered successfully"
        } else {
          window.alert('Registration Successful ✅');
        }

        // ✅ Redirect user to login
        this.router.navigate(['/auth/login']);
      },
      error: (err: any) => {
        console.error('Register error:', err);
        const errorMsg = err.error?.message || 'Registration Failed ❌';
        window.alert(errorMsg);
      }
    });
  }
}
