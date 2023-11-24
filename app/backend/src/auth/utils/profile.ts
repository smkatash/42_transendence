export interface Profile {
  id: string;
  login: string;
  image_url: string;
  provide: string;
  titles: Array<{ id: string; name: string }> | [];
  _raw: Object;
  _json: Object;
}
