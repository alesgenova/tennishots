import { Injectable } from '@angular/core';

import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class NavigationService {
  private activeSection: string;
  private activeSectionSubject = new BehaviorSubject<string>('');
  activeSection$ = this.activeSectionSubject.asObservable();

  constructor() { }

  setActiveSection(section:string){
    this.activeSection = section;
    this.activeSectionSubject.next(section);
  }

}
