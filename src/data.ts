import catalog from './content/places.cs.json';
import hotelData from './content/hotel.json';
import routeData from './content/routes.cs.json';
import healthData from './content/health.cs.json';
import type { Language } from './i18n';
export const places = catalog.places;
export const hotel = hotelData;
export const trips = routeData.routes;
export const health = healthData;
export type Place = typeof places[number];
export type Trip = typeof trips[number];
export type PlaceText = Pick<Place,'name'|'short'|'description'|'tip'|'hours'|'admission'|'coordinateNote'>;
export type TripText = Pick<Trip,'name'|'start'|'notes'>;
interface Locale { places: Record<string,PlaceText>; routes: Record<string,TripText>; }
const modules = import.meta.glob<Locale>('./content/*.json', { eager: true, import: 'default' });
export const placeText = (language: Language, id: string): PlaceText => modules[`./content/${language}.json`].places[id];
export const tripText = (language: Language, id: string): TripText => modules[`./content/${language}.json`].routes[id];
export interface Photo { placeId: string; filename: string; author: string; license: string; licenseUrl: string; sourceUrl: string; changes?: string; }
export interface MediaManifest { photos: Photo[]; }
export function photoUrl(photo: Photo) { return `/media/photos/${photo.filename}`; }
export const categories = ['pamatky','priroda','muzea','rodiny','vyhlidky','kultura','nakupy','sport','architektura'] as const;
