import { Component } from '@angular/core';
import { toggleAnimation } from 'src/app/shared/animations';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from 'src/app/service/app.service';
import { ApiService } from '../api.service';

@Component({
  templateUrl: './cover-login.html',
  animations: [toggleAnimation],
})
export class CoverLoginComponent {
  store: any;
  currYear: number = new Date().getFullYear();

  // ✅ Form fields
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    public translate: TranslateService,
    public storeData: Store<any>,
    public router: Router,
    private appSetting: AppService,
    private apiService: ApiService
  ) {
    this.initStore();
  }

  // ✅ Store subscription
  async initStore() {
    this.storeData.select((d) => d.index).subscribe((d) => {
      this.store = d;
    });
  }

  // ✅ Language switch
  changeLanguage(item: any) {
    this.translate.use(item.code);
    this.appSetting.toggleLanguage(item);
    if (this.store.locale?.toLowerCase() === 'ae') {
      this.storeData.dispatch({ type: 'toggleRTL', payload: 'rtl' });
    } else {
      this.storeData.dispatch({ type: 'toggleRTL', payload: 'ltr' });
    }
    window.location.reload();
  }

  // ✅ Login method
  doLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = '⚠️ Please enter email and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        if (res && res.message === 'Login successful') {
          // ✅ Save login data
          this.apiService.saveLoginData(res);

          // ✅ Extract user role (if available from API)
          const role = res.data?.role || 'user'; // assumes backend sends role

          // ✅ Navigate based on role
          if (role === 'admin') {
            this.router.navigate(['/admindashboard']);
          } else if (role === 'dealer') {
            this.router.navigate(['/dealerdashboard']);
          } else {
            this.router.navigate(['/all-turf']); // default
          }
        } else {
          this.errorMessage = res?.message || 'Invalid login response';
        }
      },

      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || '❌ Login failed, please try again';
        console.error('Login Failed:', err);
      },
    });
  }
}
