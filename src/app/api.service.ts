import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://192.168.1.42/sportshouseBackend';

  constructor(private http: HttpClient) {}

  // -------------------------
  // 🔹 Auth APIs
  // -------------------------
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/turf-owner/login`, credentials);
  }

  register(data: {
    owner_name: string;
    email: string;
    phone_no: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/turf-owner/register`, data);
  }

  // -------------------------
  // 🔹 Turf APIs
  // -------------------------
  createTurf(turfData: any): Observable<any> {
    const ownerId = this.getOwnerId();
    if (ownerId) turfData.owner_id = ownerId;
    return this.http.post(`${this.baseUrl}/turf/create`, turfData);
  }

  getOwnerDetails(ownerId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/turf/owner`, { owner_id: ownerId });
  }

  // -------------------------
  // 🔹 Sport APIs
  // -------------------------
  createSport(sportData: {
    turf_id: string;
    sport_name: string;
    description: string;
    is_active: string;
    created_by: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/sport/create`, sportData);
  }

  getAllSports(): Observable<any> {
    return this.http.get(`${this.baseUrl}/sport/all`);
  }

  getSportById(sport_id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/sport/id`, { sport_id });
  }

  getSportsByTurf(turf_id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/sport/by-turf/${turf_id}`);
  }

  // -------------------------
  // 🔹 Price APIs
  // -------------------------
  createPricing(priceData: {
    turf_id: string;
    sport_id: string;
    price_per_hour: number;
    currency: string;
    is_active: string;
    created_by: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/price/create`, priceData);
  }

  // -------------------------
  // 🔹 Slot APIs
  // -------------------------
  saveSlots(slotData: {
    turf_id: string;
    sport_id: string;
    day: string;
    start_time: string;
    end_time: string;
    slot_duration: number;
    start_date: string;
    end_date: string;
    slots: { start_time: string; end_time: string }[];
    price: number;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/slots/save`, slotData);
  }

  getSlotsByTurfSportDay(turfId: string, sportId: string, day: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/slots/by-turf-sport-day/${turfId}/${sportId}/${day}`, {
      headers: { Accept: 'application/json' }
    });
  }

  // -------------------------
  // 🔹 Slot Status API
  // -------------------------
  toggleSlotStatus(slot_id: string, active_status: 'Y' | 'N'): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/slots/toggle-status/${slot_id}`,
      { active_status: active_status.toLowerCase() },
      { headers: { Accept: 'application/json', 'Content-Type': 'application/json' } }
    );
  }

  // -------------------------
  // 🔹 Slot Price APIs
  // -------------------------
  getSlotPriceById(slot_id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/slot-prices/slot/${slot_id}`, {
      headers: { Accept: 'application/json' }
    });
  }

  updateSlotPrice(slot_id: string, price: number): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/slot-prices/update/${slot_id}`,
      { price },
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  // -------------------------
  // 🔹 LocalStorage Helpers
  // -------------------------
  saveLoginData(data: any): void {
    if (data?.owner) {
      const owner = {
        owner_id: data.owner.owner_id,
        owner_name: data.owner.owner_name,
        email: data.owner.email,
        phone_no: data.owner.phone_no
      };
      localStorage.setItem('loginData', JSON.stringify(owner));
    }
  }

  getLoginData(): any {
    const data = localStorage.getItem('loginData');
    return data ? JSON.parse(data) : null;
  }

  getOwnerId(): string | null {
    const loginData = this.getLoginData();
    return loginData?.owner_id || null;
  }

  clearLoginData(): void {
    localStorage.removeItem('loginData');
  }
}
