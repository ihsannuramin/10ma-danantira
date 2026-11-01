-- Starter reference data. Players can add more venues from Create Mabar.
-- Venue coordinates are left empty until they can be verified.

insert into public.areas (name, city, sort_order) values
  ('Jakarta Selatan', 'Jakarta', 1),
  ('Jakarta Pusat', 'Jakarta', 2),
  ('Jakarta Barat', 'Jakarta', 3),
  ('Jakarta Utara', 'Jakarta', 4),
  ('Jakarta Timur', 'Jakarta', 5),
  ('Tangerang Selatan', 'Tangerang', 6),
  ('Tangerang', 'Tangerang', 7),
  ('Bekasi', 'Bekasi', 8),
  ('Depok', 'Depok', 9),
  ('Bogor', 'Bogor', 10);

insert into public.venues (name, area_id)
select v.name, a.id
from (values
  ('Kemang Tennis Club', 'Jakarta Selatan'),
  ('Senayan Tennis Club', 'Jakarta Pusat'),
  ('Kelapa Gading Club', 'Jakarta Utara'),
  ('BSD Tennis Club', 'Tangerang Selatan')
) as v(name, area_name)
join public.areas a on a.name = v.area_name;
