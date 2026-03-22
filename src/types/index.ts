export interface Section {
  id: string;
  name: string;
  orderIndex: number;
  notes: NoteStub[];
}

export interface NoteStub {
  id: string;
  title: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  sectionId: string;
  title: string;
  contentMd: string;
  contentHtml: string;
  createdAt: string;
  updatedAt: string;
}
