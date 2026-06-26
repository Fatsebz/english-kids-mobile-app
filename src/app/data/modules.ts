import { EmojiItem } from './emoji-item';
import { ANIMALS } from './animals.data';
import { BODY } from './body.data';
import { ACTIONS } from './actions.data';
import { WEATHER } from './weather.data';
import { FRUITS } from './fruits.data';
import { VEGETABLES } from './vegetables.data';
import { FOOD } from './food.data';
import { FAMILY } from './family.data';
import { CLOTHES } from './clothes.data';
import { SHAPES } from './shapes.data';
import { LETTERS } from './letters.data';
import { TRANSPORT } from './transport.data';
import { FAIRYTALE } from './fairytale.data';
import { JOBS } from './jobs.data';
import { ZOO } from './zoo.data';
import { SPORTS } from './sports.data';
import { CHRISTMAS } from './christmas.data';
import { TABLEWARE } from './tableware.data';
import { SCHOOL } from './school.data';
import { HOUSE } from './house.data';
import { BEACH } from './beach.data';
import { DAYS } from './days.data';
import { MONTHS } from './months.data';
import { INSTRUMENTS } from './instruments.data';

/** Décrit un module d'apprentissage illustré par des emojis (piloté par les données). */
export interface LearnModule {
  /** Identifiant utilisé dans l'URL (`/m/:id`). */
  id: string;
  /** Titre anglais affiché en haut de l'écran et sur la tuile. */
  title: string;
  /** Sous-titre français (tuile d'accueil). */
  fr: string;
  /** Emoji de la tuile d'accueil. */
  tileEmoji: string;
  /** Dégradé CSS de fond de la tuile. */
  gradient: string;
  /** Les éléments enseignés. */
  items: EmojiItem[];
  /**
   * Compatible avec le mode « écoute → choisir l'image ». `false` quand les éléments
   * n'ont pas de visuel distinct (ex. jours/mois, dont le visuel n'est qu'un numéro).
   * Par défaut `true`.
   */
  listen?: boolean;
}

/**
 * Registre des modules « emoji ».
 * Pour ajouter un module : créer un fichier `xxx.data.ts` (EmojiItem[]) et ajouter une entrée ici.
 */
export const MODULES: LearnModule[] = [
  {
    id: 'animals',
    title: 'Animals',
    fr: 'Les animaux',
    tileEmoji: '🐄',
    gradient: 'linear-gradient(150deg, #2ec27e, #ffd23f)',
    items: ANIMALS,
  },
  {
    id: 'body',
    title: 'Body',
    fr: 'Le corps',
    tileEmoji: '👋',
    gradient: 'linear-gradient(150deg, #ff8e53, #ff6fae)',
    items: BODY,
  },
  {
    id: 'actions',
    title: 'Actions',
    fr: 'Les actions',
    tileEmoji: '🏃',
    gradient: 'linear-gradient(150deg, #8e44ad, #4dabf7)',
    items: ACTIONS,
  },
  {
    id: 'weather',
    title: 'Weather',
    fr: 'La météo',
    tileEmoji: '☀️',
    gradient: 'linear-gradient(150deg, #4dabf7, #ffd23f)',
    items: WEATHER,
  },
  {
    id: 'fruits',
    title: 'Fruits',
    fr: 'Les fruits',
    tileEmoji: '🍓',
    gradient: 'linear-gradient(150deg, #e63946, #ff8e53)',
    items: FRUITS,
  },
  {
    id: 'vegetables',
    title: 'Vegetables',
    fr: 'Les légumes',
    tileEmoji: '🥕',
    gradient: 'linear-gradient(150deg, #2ec27e, #a8e063)',
    items: VEGETABLES,
  },
  {
    id: 'food',
    title: 'Food',
    fr: 'La nourriture',
    tileEmoji: '🍔',
    gradient: 'linear-gradient(150deg, #ff8c1a, #ffd23f)',
    items: FOOD,
  },
  {
    id: 'family',
    title: 'Family',
    fr: 'La famille',
    tileEmoji: '👨‍👩‍👧',
    gradient: 'linear-gradient(150deg, #ff6fae, #8e44ad)',
    items: FAMILY,
  },
  {
    id: 'clothes',
    title: 'Clothes',
    fr: 'Les vêtements',
    tileEmoji: '👕',
    gradient: 'linear-gradient(150deg, #ff6fae, #4dabf7)',
    items: CLOTHES,
  },
  {
    id: 'shapes',
    title: 'Shapes',
    fr: 'Les formes',
    tileEmoji: '🔷',
    gradient: 'linear-gradient(150deg, #4dabf7, #8e44ad)',
    items: SHAPES,
  },
  {
    id: 'letters',
    title: 'Letters',
    fr: 'L\'alphabet',
    tileEmoji: '🔤',
    gradient: 'linear-gradient(150deg, #2ec27e, #4dabf7)',
    items: LETTERS,
  },
  {
    id: 'transport',
    title: 'Transport',
    fr: 'Les transports',
    tileEmoji: '🚗',
    gradient: 'linear-gradient(150deg, #ff6b6b, #4dabf7)',
    items: TRANSPORT,
  },
  {
    id: 'fairytale',
    title: 'Fairy tale',
    fr: 'Les contes',
    tileEmoji: '🦄',
    gradient: 'linear-gradient(150deg, #ff6fae, #ffd23f)',
    items: FAIRYTALE,
  },
  {
    id: 'jobs',
    title: 'Jobs',
    fr: 'Les métiers',
    tileEmoji: '👷',
    gradient: 'linear-gradient(150deg, #4dabf7, #ff8e53)',
    items: JOBS,
  },
  {
    id: 'zoo',
    title: 'Zoo',
    fr: 'Le zoo',
    tileEmoji: '🦁',
    gradient: 'linear-gradient(150deg, #ffd23f, #2ec27e)',
    items: ZOO,
  },
  {
    id: 'sports',
    title: 'Sports',
    fr: 'Le sport',
    tileEmoji: '⚽',
    gradient: 'linear-gradient(150deg, #2ec27e, #4dabf7)',
    items: SPORTS,
  },
  {
    id: 'christmas',
    title: 'Christmas',
    fr: 'Noël',
    tileEmoji: '🎄',
    gradient: 'linear-gradient(150deg, #e63946, #2ec27e)',
    items: CHRISTMAS,
  },
  {
    id: 'tableware',
    title: 'Tableware',
    fr: 'À table',
    tileEmoji: '🍽️',
    gradient: 'linear-gradient(150deg, #8e44ad, #ff6fae)',
    items: TABLEWARE,
  },
  {
    id: 'school',
    title: 'School',
    fr: 'L\'école',
    tileEmoji: '✏️',
    gradient: 'linear-gradient(150deg, #ff8c1a, #4dabf7)',
    items: SCHOOL,
  },
  {
    id: 'house',
    title: 'House',
    fr: 'La maison',
    tileEmoji: '🏠',
    gradient: 'linear-gradient(150deg, #4dabf7, #ff6fae)',
    items: HOUSE,
  },
  {
    id: 'beach',
    title: 'Beach',
    fr: 'La plage',
    tileEmoji: '🏖️',
    gradient: 'linear-gradient(150deg, #ffd23f, #4dabf7)',
    items: BEACH,
  },
  {
    id: 'days',
    title: 'Days',
    fr: 'Les jours',
    tileEmoji: '📅',
    gradient: 'linear-gradient(150deg, #8e44ad, #4dabf7)',
    items: DAYS,
    listen: false,
  },
  {
    id: 'months',
    title: 'Months',
    fr: 'Les mois',
    tileEmoji: '🗓️',
    gradient: 'linear-gradient(150deg, #ff6b6b, #8e44ad)',
    items: MONTHS,
    listen: false,
  },
  {
    id: 'instruments',
    title: 'Instruments',
    fr: 'La musique',
    tileEmoji: '🎸',
    gradient: 'linear-gradient(150deg, #e63946, #4dabf7)',
    items: INSTRUMENTS,
  },
];

/** Retrouve un module par son id (segment d'URL). */
export function findModule(id: string | null | undefined): LearnModule | undefined {
  return MODULES.find((m) => m.id === id);
}
