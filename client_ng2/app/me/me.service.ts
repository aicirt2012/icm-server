import {Injectable} from '@angular/core';

@Injectable()
export class MeService {


  private name:any;

  constructor() {
    setTimeout(()=> {
      if(name == 'Daniel')
        name = 'Felix';
      else
        name = 'Daniel';
      console.log(name);
    }, 1000);
  }

  public GetMe = ():any => {

    return name;
  }



}
