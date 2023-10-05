export interface Profile {
    id: string
    login: string
    image_url: string
    provide: string
	
    _raw: Object
    _json: {
		titles: [ {
			id: number,
			name: string
		} ]
	}
}