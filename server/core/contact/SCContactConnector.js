import config from '../../../config/env';
import SocioCortex from './SocioCortex';


export default class SCContactConnector extends SocioCortex{

  static getContacts(){
    console.log('get contacts');
    return super.get('entityTypes/11rs7h6n9ioej/entities?attributes=*&meta=lastModifiedAt');
  }


}
