//Le <T> est une sorte de variable pour les types.
//Exemple: Ici, on dit : "Je veux une réponse OpenAlex dont les résultats sont des 'Work'"
// this.http.get<OpenAlexResponse<Work>>(url).subscribe(data => {
//    console.log(data.results[0].title);
// });
export interface OpenAlexResponse<T> {
  meta: OpenAlexMeta;
  results: T[];
  group_by?: OpenAlexGroupByResult[]; // Optionnel, si vous utilisez les agrégations
}
export interface OpenAlexFilters {
  language?: string; // Filtrer par langue (ex: "en" pour anglais)
  is_oa?: boolean; // Filtrer par accès ouvert
}

export interface OpenAlexMeta {
  count: number; // Nombre total de résultats
  db_response_time_ms: number;
  page: number; // Page actuelle
  per_page: number; // Résultats par page
  groups_count: number | null;
}
export interface OpenAlexGroupByResult {
  key: string; // L'ID OpenAlex (ex: "https://openalex.org/institutions/I123")
  key_display_name: string; // Le nom lisible (ex: "Université de Montréal")
  count: number; // Le nombre d'occurrences (ex: 450 articles)
}
export interface OpenAlexWork {
  id: string; //The OpenAlex ID for this work.
  doi: string | null; //All the external identifiers that we know about for this work.
  display_name: string; //The title of this work.
  abstract_inverted_index: AbstractInvertedIndex | null;
  language: string; //The language this work is written in, using ISO 639-1 codes.
  publication_year: number;
  publication_date: string;
  updated_date: string;
  primary_topic: Topic | null;
  locations_count: number; //Number of locations for this work.
  type: WorkDTO;
  primary_location: Location | null;
  best_oa_location: OpenAlexBestOaLocation | null;
  open_access: OpenAccess;
  awards: Awards[];
  // authorships: Authorship[];
  concepts: Concept[];
  // cited_by_count: number;
  // referenced_works: string[];
  // related_works: string[];
  // counts_by_year: CountByYear[];
}
export interface Awards {
  id: string;
  display_name: string;
  funder_award_id: string;
  funder_id: string;
  funder_display_name: string;
  doi: string;
}
export interface Authorship {
  author_position: 'first' | 'middle' | 'last';
  author: {
    id: string;
    display_name: string;
    orcid?: string;
  };
  institutions: Institution[];
}

export interface Institution {
  id: string;
  display_name: string;
  ror?: string;
  country_code: string;
  type: string;
}
export interface OpenAccess {
  is_oa: boolean;
  oa_status: OaStatus;
  oa_url: string | null;
  any_repository_has_fulltext: boolean;
}

export interface Location {
  is_oa: boolean;
  landing_page_url: string;
  pdf_url: string | null;
  source: {
    id: string;
    display_name: string;
    issn_l?: string;
    type: string;
  } | null;
}

export interface Concept {
  id: string;
  display_name: string;
  level: number;
  score: number;
}

export interface CountByYear {
  year: number;
  cited_by_count: number;
}
export interface Topic {
  /** Identifiant OpenAlex du topic */
  id: string;

  /** Nom lisible du topic */
  display_name: string;

  /** Score de pertinence du topic pour ce work */
  score: number;

  /** Domaine scientifique principal */
  domain?: {
    id: string;
    display_name: string;
  };

  /** Champ (field) scientifique */
  field?: {
    id: string;
    display_name: string;
  };

  /** Sous-champ (subfield) */
  subfield?: {
    id: string;
    display_name: string;
  };
}
export interface OpenAlexBestOaLocation {
  /** Indique si la localisation est en libre accès */
  is_oa: boolean;

  /** Page de consultation (HTML) */
  landing_page_url: string | null;

  /** Lien direct vers le PDF (si disponible) */
  pdf_url: string | null;

  /** Informations sur la source */
  source: {
    id: string;
    display_name: string;
    type: 'publisher' | 'repository';
    issn_l: string | null;
    issn: string[] | null;
    host_organization: string | null;
  };

  /** Licence open access (ex: CC-BY, CC-BY-NC) */
  license: string | null;

  /** Version du document */
  version: OpenAlexVersion;
}
export type AbstractInvertedIndex = {
  [word: string]: number[];
};
export type OaStatus = 'gold' | 'green' | 'hybrid' | 'bronze' | 'closed';
export interface StatusDetail {
  label: string;
  icon: string;
  color: string;
  description: string;
}

export const OA_STATUS_DETAILS: Record<OaStatus, StatusDetail> = {
  gold: {
    label: 'Or (Gold)',
    icon: 'workspace_premium',
    color: '#FFD700',
    description:
      "Disponible librement sur le site de l'éditeur dans une revue 100% Open Access.",
  },
  hybrid: {
    label: 'Hybride',
    icon: 'verified_user',
    color: '#4CAF50',
    description:
      "Article en libre accès dans une revue par ailleurs payante (frais payés par l'auteur).",
  },
  green: {
    label: 'Vert (Green)',
    icon: 'archive',
    color: '#2E7D32',
    description:
      "Version déposée dans une archive ouverte (ex: HAL, arXiv) par l'auteur.",
  },
  bronze: {
    label: 'Bronze',
    icon: 'visibility',
    color: '#CD7F32',
    description:
      "Gratuit à lire sur le site de l'éditeur, mais sans licence libre explicite.",
  },
  closed: {
    label: 'Fermé',
    icon: 'lock',
    color: '#757575',
    description: "L'accès nécessite un abonnement ou un paiement à l'acte.",
  },
};
export type OpenAccessInfo = {
  is_oa: boolean;
  oa_status: 'gold' | 'green' | 'hybrid' | 'bronze' | 'closed';
  oa_url: string | null;
  any_repository_has_fulltext: boolean;
};
export type OpenAlexVersion =
  | 'publishedVersion'
  | 'acceptedVersion'
  | 'submittedVersion'
  | string;
export interface WorkDTO {
  type: WorkType;
}
export type WorkType =
  | 'article'
  | 'preprint'
  | 'review'
  | 'letter'
  | 'editorial'
  | 'erratum'
  | 'libguides'
  | 'supplementary-materials'
  | 'paratext'
  | string; // Pour couvrir tous les autres types éventuels
