// Types matching
export interface Category {
  _id: string;
  name: string;
  image: string;
}

export interface Tool {
  toolId: string;
  toolName: string;
  logo: string;
  toolType: string;
}

export interface Resource {
  _id: string;
  name: string;
  created_at: string;
  type: {
    _id: string;
    name: string;
  };
  tool: {
    name: string;
    logo: string;
  };
}

export interface ResourceType {
  _id: string;
  name: string;
}