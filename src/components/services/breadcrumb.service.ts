import { Injectable } from '@angular/core';

import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';


interface Breadcrumb {
  label: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {

private breadcrumbs$ = new BehaviorSubject<Breadcrumb[]>([]);

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const breadcrumbs = this.buildBreadcrumbs(this.router.routerState.snapshot.root);
        this.breadcrumbs$.next(breadcrumbs);
      });
  }

  getBreadcrumbs() {
    return this.breadcrumbs$.asObservable();
  }

  private buildBreadcrumbs(route: ActivatedRouteSnapshot, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    if (route.routeConfig && route.routeConfig.data) {
      const label = route.routeConfig.data['breadcrumb'];
      const path = route.routeConfig.path ? `/${route.routeConfig.path}` : '';
      const nextUrl = `${url}${path}`;
      breadcrumbs.push({ label, url: nextUrl });
    }
  
 
    if (route.firstChild) {
      return this.buildBreadcrumbs(route.firstChild, url, breadcrumbs);
    }
  
    return breadcrumbs;
  }
}
