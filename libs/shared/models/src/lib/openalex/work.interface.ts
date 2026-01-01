// TODO: Vérifier les champs avec la Docs et ajouter ceux nécessaires

export interface OpenAlexWork {
  id: string;
  doi: string | null;
  title: string;
  display_name: string;
  publication_year: number;
  publication_date: string;
  type: string;
  authorships: Authorship[];
  primary_location: Location | null;
  concepts: Concept[];
  cited_by_count: number;
  abstract_inverted_index: { [key: string]: number[] } | null;
  referenced_works: string[];
  related_works: string[];
  counts_by_year: CountByYear[];
  updated_date: string;
  created_date: string;
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