import { Routes } from '@angular/router';

// dashboard
import { IndexComponent } from './index';
import { AnalyticsComponent } from './analytics';
import { FinanceComponent } from './finance';
import { CryptoComponent } from './crypto';

// widgets
import { WidgetsComponent } from './widgets';

// tables
import { TablesComponent } from './tables';

// font-icons
import { FontIconsComponent } from './font-icons';

// charts
import { ChartsComponent } from './charts';

// dragndrop
import { DragndropComponent } from './dragndrop';
import { AddTurfComponent } from './pages/add-turf/add-turf';
import { AllTurfComponent } from './pages/all-turf/all-turf';
import { SportMasterComponent } from './pages/sportsmaster/sportsmaster';
import { SlotGeneratorComponent } from './pages/slotmaster/slotmaster';
import { EditSlotPriceComponent } from './pages/edit-slot-price/edit-slot-price';

// layouts
import { AppLayout } from './layouts/app-layout';
import { AuthLayout } from './layouts/auth-layout';

// pages
import { KnowledgeBaseComponent } from './pages/knowledge-base';
import { FaqComponent } from './pages/faq';
import { CoverLoginComponent } from './auth/cover-login'; // login page

export const routes: Routes = [
    // Auth layout first
    {
        path: '',
        component: AuthLayout,
        children: [
            // redirect default to login
            { path: '', redirectTo: 'login', pathMatch: 'full' },

            // login page
            { path: 'login', component: CoverLoginComponent },

            // pages
            { path: '', loadChildren: () => import('./pages/pages.module').then((d) => d.PagesModule) },

            // auth
            { path: '', loadChildren: () => import('./auth/auth.module').then((d) => d.AuthModule) },
        ],
    },

    // App layout
    {
        path: '',
        component: AppLayout,
        children: [
            // dashboard
            { path: 'index', component: IndexComponent, data: { title: 'Sales Admin' } },
            { path: 'analytics', component: AnalyticsComponent, data: { title: 'Analytics Admin' } },
            { path: 'finance', component: FinanceComponent, data: { title: 'Finance Admin' } },
            { path: 'crypto', component: CryptoComponent, data: { title: 'Crypto Admin' } },
            { path: 'add-turf', component: AddTurfComponent, data: { title: 'Add Turf' } },
            { path: 'all-turf', component: AllTurfComponent, data: { title: 'All Turf' } },
            { path: 'sportsmaster', component: SportMasterComponent, data: { title: 'Sports Master' } },
            { path: 'slotmaster', component: SlotGeneratorComponent, data: { title: 'Slot Master' } },
            { path: 'edit-slot-price', component: EditSlotPriceComponent, data: { title: 'Edit Slot Price' } },

            // widgets
            { path: 'widgets', component: WidgetsComponent, data: { title: 'Widgets' } },

            // font-icons
            { path: 'font-icons', component: FontIconsComponent, data: { title: 'Font Icons' } },

            // charts
            { path: 'charts', component: ChartsComponent, data: { title: 'Charts' } },

            // dragndrop
            { path: 'dragndrop', component: DragndropComponent, data: { title: 'Dragndrop' } },

            // pages
            { path: 'pages/knowledge-base', component: KnowledgeBaseComponent, data: { title: 'Knowledge Base' } },
            { path: 'pages/faq', component: FaqComponent, data: { title: 'FAQ' } },

            // apps
            { path: '', loadChildren: () => import('./apps/apps.module').then((d) => d.AppsModule) },

            // components
            { path: '', loadChildren: () => import('./components/components.module').then((d) => d.ComponentsModule) },

            // elements
            { path: '', loadChildren: () => import('./elements/elements.module').then((d) => d.ElementsModule) },

            // forms
            { path: '', loadChildren: () => import('./forms/form.module').then((d) => d.FormModule) },

            // users
            { path: '', loadChildren: () => import('./users/user.module').then((d) => d.UsersModule) },

            // tables
            { path: 'tables', component: TablesComponent, data: { title: 'Tables' } },
            { path: '', loadChildren: () => import('./datatables/datatables.module').then((d) => d.DatatablesModule) },
        ],
    },
];
