export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  type: 'free' | 'form';
  image: string;
  viewCount: number;
  useCount: number;
  premium: boolean;
}

export type TemplateCategory =
  | 'wedding'
  | 'graduation'
  | 'birthday'
  | 'event'
  | 'anniversary'
  | 'wishes';

export interface FilterOption {
  id: string;
  name: string;
  icon?: string;
}

export const categories: FilterOption[] = [
  { id: 'wedding', name: 'Thiệp cưới' },
  { id: 'graduation', name: 'Thiệp tốt nghiệp' },
  { id: 'birthday', name: 'Thiệp sinh nhật' },
  { id: 'event', name: 'Thiệp sự kiện' },
  { id: 'anniversary', name: 'Thiệp kỷ niệm' },
  { id: 'wishes', name: 'Thiệp lời chúc' },
];

export const typeOptions: FilterOption[] = [
  { id: 'all', name: 'Tất cả' },
  { id: 'free', name: 'Tự do' },
  { id: 'form', name: 'Biểu mẫu' },
];

export const sortOptions: FilterOption[] = [
  { id: 'recent', name: 'Vừa cập nhật' },
  { id: 'popular', name: 'Phổ biến nhất' },
  { id: 'views', name: 'Lượt xem cao' },
];

export const templates: Template[] = [
  {
    id: '44deae86-d256-438d-953b-08634f43f579',
    name: 'Thiệp Cưới 10 Pre',
    category: 'wedding',
    type: 'free',
    image: 'https://cdn-resource.zenlove.me/templates/44deae86-d256-438d-953b-08634f43f579/long_44deae86-d256-438d-953b-08634f43f579.webp?format=webp&quality=80',
    viewCount: 705,
    useCount: 38,
    premium: false,
  },
  {
    id: 'eacdb4ad-cbaf-455e-96ba-ddd1d82d9d57',
    name: 'Thiệp Cưới 128 Pre',
    category: 'wedding',
    type: 'free',
    image: 'https://cdn-resource.zenlove.me/templates/eacdb4ad-cbaf-455e-96ba-ddd1d82d9d57/long_eacdb4ad-cbaf-455e-96ba-ddd1d82d9d57.webp?format=webp&quality=80',
    viewCount: 38,
    useCount: 29,
    premium: false,
  },
  {
    id: 'ae71ea8f-04b9-4af0-9af8-654bb09536ae',
    name: 'Thiệp Cưới 44 Pre',
    category: 'wedding',
    type: 'free',
    image: 'https://cdn-resource.zenlove.me/templates/ae71ea8f-04b9-4af0-9af8-654bb09536ae/long_ae71ea8f-04b9-4af0-9af8-654bb09536ae.webp?format=webp&quality=80',
    viewCount: 29,
    useCount: 21,
    premium: false,
  },
  {
    id: 'be56fc48-f365-4a34-88b7-f4b66ba0c675',
    name: 'Thiệp Cưới 99 Premium',
    category: 'wedding',
    type: 'form',
    image: 'https://cdn-resource.zenlove.me/templates/be56fc48-f365-4a34-88b7-f4b66ba0c675/long_be56fc48-f365-4a34-88b7-f4b66ba0c675.webp?format=webp&quality=80',
    viewCount: 21,
    useCount: 15,
    premium: true,
  },
  {
    id: 'a8b6ea72-3877-40db-9c75-d1a7c0ae7fe8',
    name: 'Thiệp Cưới 108 Basic',
    category: 'wedding',
    type: 'free',
    image: 'https://cdn-resource.zenlove.me/templates/a8b6ea72-3877-40db-9c75-d1a7c0ae7fe8/long_a8b6ea72-3877-40db-9c75-d1a7c0ae7fe8.webp?format=webp&quality=80',
    viewCount: 15,
    useCount: 8,
    premium: false,
  },
  {
    id: '289f08c3-1024-42a7-b437-adf7ed7911bb',
    name: 'Thiệp Cưới 88 Pre',
    category: 'wedding',
    type: 'free',
    image: 'https://cdn-resource.zenlove.me/templates/289f08c3-1024-42a7-b437-adf7ed7911bb/long_289f08c3-1024-42a7-b437-adf7ed7911bb.jpg?format=webp&quality=80',
    viewCount: 8,
    useCount: 5,
    premium: false,
  },
  {
    id: '5a13b180-bd5a-414f-a489-58596e89c42a',
    name: 'Thiệp Cưới 90 Pre',
    category: 'wedding',
    type: 'free',
    image: 'https://cdn-resource.zenlove.me/templates/5a13b180-bd5a-414f-a489-58596e89c42a/long_5a13b180-bd5a-414f-a489-58596e89c42a.jpg?format=webp&quality=80',
    viewCount: 5,
    useCount: 3,
    premium: false,
  },
  {
    id: '9e93d16e-f13d-494a-b67b-fa475232de64',
    name: 'Thiệp cưới 66 Pre',
    category: 'wedding',
    type: 'free',
    image: 'https://cdn-resource.zenlove.me/templates/9e93d16e-f13d-494a-b67b-fa475232de64/long_9e93d16e-f13d-494a-b67b-fa475232de64.webp?format=webp&quality=80',
    viewCount: 3,
    useCount: 2,
    premium: false,
  },
  {
    id: 'c1328fd2-218a-49e6-8e07-aa5b824c758d',
    name: 'Thiệp Cưới 110 Pre',
    category: 'wedding',
    type: 'free',
    image: 'https://cdn-resource.zenlove.me/templates/c1328fd2-218a-49e6-8e07-aa5b824c758d/long_c1328fd2-218a-49e6-8e07-aa5b824c758d.webp?format=webp&quality=80',
    viewCount: 2,
    useCount: 1,
    premium: false,
  },
  {
    id: 'ab6b5944-69d8-45c8-9923-679f6bfe967d',
    name: 'Thiệp Cưới 86 Pre',
    category: 'wedding',
    type: 'free',
    image: 'https://cdn-resource.zenlove.me/templates/ab6b5944-69d8-45c8-9923-679f6bfe967d/long_ab6b5944-69d8-45c8-9923-679f6bfe967d.webp?format=webp&quality=80',
    viewCount: 1,
    useCount: 1,
    premium: false,
  },
  {
    id: 'ed0ccd4a-e6e0-49a5-b720-a38908dff7bf',
    name: 'Thiệp Cưới 74 Pre',
    category: 'wedding',
    type: 'free',
    image: 'https://cdn-resource.zenlove.me/templates/ed0ccd4a-e6e0-49a5-b720-a38908dff7bf/long_ed0ccd4a-e6e0-49a5-b720-a38908dff7bf.jpg?format=webp&quality=80',
    viewCount: 1,
    useCount: 0,
    premium: false,
  },
  {
    id: '414508f9-80a7-405c-8fcc-909e6f3da129',
    name: 'Thiệp Cưới 75 Pre',
    category: 'wedding',
    type: 'free',
    image: 'https://cdn-resource.zenlove.me/templates/414508f9-80a7-405c-8fcc-909e6f3da129/long_414508f9-80a7-405c-8fcc-909e6f3da129.webp?format=webp&quality=80',
    viewCount: 0,
    useCount: 0,
    premium: false,
  },
  {
    id: '97041aaf-a789-4dea-a1a7-eefea0af5879',
    name: 'Thiệp Cưới 129 Pre',
    category: 'wedding',
    type: 'free',
    image: 'https://cdn-resource.zenlove.me/templates/97041aaf-a789-4dea-a1a7-eefea0af5879/long_97041aaf-a789-4dea-a1a7-eefea0af5879.webp?format=webp&quality=80',
    viewCount: 0,
    useCount: 0,
    premium: false,
  },
  {
    id: 'e7e32b0b-b174-401e-a6fb-350bf82dd6b4',
    name: 'Thiệp Cưới 100 Basic',
    category: 'wedding',
    type: 'free',
    image: 'https://cdn-resource.zenlove.me/templates/e7e32b0b-b174-401e-a6fb-350bf82dd6b4/long_e7e32b0b-b174-401e-a6fb-350bf82dd6b4.webp?format=webp&quality=80',
    viewCount: 0,
    useCount: 0,
    premium: false,
  },
  {
    id: '5dba78ff-86eb-410a-b8d0-960e8dd1863c',
    name: 'Thiệp sinh nhật 05 Free',
    category: 'birthday',
    type: 'free',
    image: 'https://cdn-resource.zenlove.me/templates/5dba78ff-86eb-410a-b8d0-960e8dd1863c/long_5dba78ff-86eb-410a-b8d0-960e8dd1863c.webp?format=webp&quality=80',
    viewCount: 0,
    useCount: 0,
    premium: false,
  },
  {
    id: 'd69badd9-6cdf-41ae-b6cc-31f1abedd3fc',
    name: 'Thiệp Cưới 221 Pre',
    category: 'wedding',
    type: 'free',
    image: 'https://cdn-resource.zenlove.me/templates/d69badd9-6cdf-41ae-b6cc-31f1abedd3fc/long_d69badd9-6cdf-41ae-b6cc-31f1abedd3fc.webp?format=webp&quality=80',
    viewCount: 0,
    useCount: 0,
    premium: false,
  },
  {
    id: '5e619aa0-494b-4090-b5fd-5ee7f86d2d70',
    name: 'Thiệp Cưới 11 Pre',
    category: 'wedding',
    type: 'free',
    image: 'https://cdn-resource.zenlove.me/templates/5e619aa0-494b-4090-b5fd-5ee7f86d2d70/long_5e619aa0-494b-4090-b5fd-5ee7f86d2d70.webp?format=webp&quality=80',
    viewCount: 0,
    useCount: 0,
    premium: false,
  },
  {
    id: 'f46bfd4d-32f3-4fad-818c-6ddf005b42d9',
    name: 'Thiệp Cưới Rồng Xanh',
    category: 'wedding',
    type: 'form',
    image: 'https://cdn-resource.zenlove.me/templates/f46bfd4d-32f3-4fad-818c-6ddf005b42d9/long_f46bfd4d-32f3-4fad-818c-6ddf005b42d9.webp?format=webp&quality=80',
    viewCount: 0,
    useCount: 0,
    premium: true,
  },
  {
    id: 'dcd31536-4ba3-4232-98f2-af4c2ad5c0af',
    name: 'Một Nhà 01',
    category: 'wedding',
    type: 'free',
    image: 'https://cdn-resource.zenlove.me/templates/dcd31536-4ba3-4232-98f2-af4c2ad5c0af/long_dcd31536-4ba3-4232-98f2-af4c2ad5c0af.jpg?format=webp&quality=80',
    viewCount: 0,
    useCount: 0,
    premium: false,
  },
  {
    id: '1a2b3c4d-graduation-01',
    name: 'Thiệp Tốt Nghiệp Rực Rỡ',
    category: 'graduation',
    type: 'free',
    image: 'https://cdn-resource.zenlove.me/templates/1a2b3c4d-graduation-01/long_1a2b3c4d-graduation-01.webp?format=webp&quality=80',
    viewCount: 0,
    useCount: 0,
    premium: false,
  },
  {
    id: '2b3c4d5e-birthday-form',
    name: 'Thiệp Sinh Nhật Vintage',
    category: 'birthday',
    type: 'form',
    image: 'https://cdn-resource.zenlove.me/templates/2b3c4d5e-birthday-form/long_2b3c4d5e-birthday-form.webp?format=webp&quality=80',
    viewCount: 0,
    useCount: 0,
    premium: false,
  },
  {
    id: '3c4d5e6f-event-01',
    name: 'Thiệp Sự Kiện Cao Cấp',
    category: 'event',
    type: 'form',
    image: 'https://cdn-resource.zenlove.me/templates/3c4d5e6f-event-01/long_3c4d5e6f-event-01.webp?format=webp&quality=80',
    viewCount: 0,
    useCount: 0,
    premium: true,
  },
  {
    id: '4d5e6f7a-anniversary-01',
    name: 'Thiệp Kỷ Niệm 10 Năm',
    category: 'anniversary',
    type: 'free',
    image: 'https://cdn-resource.zenlove.me/templates/4d5e6f7a-anniversary-01/long_4d5e6f7a-anniversary-01.webp?format=webp&quality=80',
    viewCount: 0,
    useCount: 0,
    premium: false,
  },
  {
    id: '5e6f7a8b-wishes-01',
    name: 'Thiệp Lời Chúc Ấm Áp',
    category: 'wishes',
    type: 'free',
    image: 'https://cdn-resource.zenlove.me/templates/5e6f7a8b-wishes-01/long_5e6f7a8b-wishes-01.webp?format=webp&quality=80',
    viewCount: 0,
    useCount: 0,
    premium: false,
  },
];