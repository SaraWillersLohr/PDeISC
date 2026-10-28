-- agrego asociaciones y especies en espera, y actualizo los enlaces de fuentes ya registradas.
INSERT INTO fuentes_eventos (codigo_fuente,nombre,url,especie,raza,pais) VALUES
('angus_argentina','Asociación Argentina de Angus','https://www.angus.org.ar/','bovino','angus','Argentina'),
('hereford_argentina','Asociación Argentina de Criadores de Hereford','https://www.hereford.org.ar/','bovino','hereford','Argentina'),
('brangus_argentina','Asociación Argentina de Brangus','https://brangus.org.ar/','bovino','brangus','Argentina'),
('bonsmara_argentina','Asociación Argentina de Criadores de Bonsmara','https://bonsmara.org.ar/','bovino','bonsmara','Argentina'),
('bovino_criollo_argentina','Asociación Argentina de Criadores de Ganado Bovino Criollo','https://bovinocriollo.com.ar/','bovino','criollo','Argentina'),
('cuarto_de_milla_argentina','Criadores Argentinos de Caballos Cuarto de Milla','https://www.caccm.com.ar/','equino','cuarto de milla','Argentina'),
('caballo_de_polo_argentina','Asociación Argentina de Criadores de Caballos de Polo','https://criapoloargentino.com.ar/','equino','caballo de polo','Argentina'),
('caballos_arabes_argentina','Asociación Argentina de Criadores de Caballos Árabes','https://www.aacca.com.ar/','equino','árabe','Argentina'),
('spc_argentina','Criadores Argentinos del Sangre Pura de Carrera','https://criadores-spc.com.ar/','equino','sangre pura de carrera','Argentina'),
('caballo_peruano_argentina','Asociación Argentina de Criadores de Caballos Peruanos','https://aaccpp.org.ar/','equino','caballo peruano','Argentina'),
('caballos_criollos_argentina','Asociación Argentina de Criadores de Caballos Criollos','https://caballoscriollos.com/','equino','criollo','Argentina'),
('braford_argentina','Asociación Braford Argentina','https://www.braford.org.ar/','bovino','braford','Argentina'),
('merino_argentina','Asociación Argentina Criadores de Merino','https://www.merino.org.ar/','ovino','merino','Argentina'),
('hampshire_down_argentina','Asociación Criadores de Hampshire Down','https://hampshiredown.org.ar/','ovino','hampshire down','Argentina'),
('corriedale_argentina','Asociación Argentina Criadores de Corriedale','https://www.corriedale.org.ar/','ovino','corriedale','Argentina'),
('porcinos_argentina','Asociación Argentina Productores de Porcinos','https://porcinos.org.ar/','porcino',NULL,'Argentina')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre),url=VALUES(url),especie=VALUES(especie),raza=VALUES(raza),pais=VALUES(pais);
