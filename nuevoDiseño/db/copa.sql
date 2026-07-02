-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 26-06-2026 a las 19:54:13
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `copa`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `canchas`
--

CREATE TABLE `canchas` (
  `ID_CANCHA` int(1) UNSIGNED NOT NULL,
  `NOMBRE` varchar(30) CHARACTER SET utf8 COLLATE utf8_spanish_ci DEFAULT NULL,
  `DIRECCION` varchar(30) CHARACTER SET utf8 COLLATE utf8_spanish_ci NOT NULL,
  `LOCALIDAD` varchar(256) CHARACTER SET utf8 COLLATE utf8_spanish_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `canchas`
--

INSERT INTO `canchas` (`ID_CANCHA`, `NOMBRE`, `DIRECCION`, `LOCALIDAD`) VALUES
(1, 'MEGA FUTBOL', 'Rincon 2875', 'San Justo'),
(2, 'Mistica Deportes (EX Galpon)', 'Sgto. Cabral 1563', 'Ramos Mejía'),
(3, 'La Capilla', 'Colón 1485', 'Ramos Mejía');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estadisticas`
--

CREATE TABLE `estadisticas` (
  `ID_ESTADISTICAS` int(3) NOT NULL,
  `PARTIDOS_JUGADOS` int(4) UNSIGNED NOT NULL,
  `PARTIDOS_GANADOS` int(4) UNSIGNED NOT NULL,
  `PARTIDOS_PERDIDOS` int(4) UNSIGNED NOT NULL,
  `PARTIDOS_EMPATADOS` int(4) UNSIGNED NOT NULL,
  `GOLES` int(4) UNSIGNED NOT NULL,
  `ASISTENCIAS` int(4) UNSIGNED NOT NULL,
  `ID_JUGADOR` int(3) UNSIGNED NOT NULL,
  `RACHA` int(2) UNSIGNED ZEROFILL NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `estadisticas`
--

INSERT INTO `estadisticas` (`ID_ESTADISTICAS`, `PARTIDOS_JUGADOS`, `PARTIDOS_GANADOS`, `PARTIDOS_PERDIDOS`, `PARTIDOS_EMPATADOS`, `GOLES`, `ASISTENCIAS`, `ID_JUGADOR`, `RACHA`) VALUES
(1, 6, 4, 2, 0, 17, 11, 1, 02),
(2, 3, 1, 2, 0, 1, 1, 2, 01),
(3, 8, 5, 2, 1, 12, 6, 3, 00),
(4, 8, 4, 3, 1, 12, 8, 4, 00),
(5, 1, 1, 0, 0, 2, 0, 5, 01),
(6, 8, 3, 4, 1, 2, 3, 6, 00),
(7, 3, 1, 1, 1, 7, 1, 7, 01),
(8, 7, 2, 4, 1, 15, 4, 8, 02),
(9, 8, 5, 2, 1, 11, 8, 9, 03),
(10, 2, 1, 1, 0, 3, 2, 10, 00),
(11, 7, 4, 2, 1, 14, 9, 11, 02),
(12, 4, 1, 3, 0, 5, 0, 14, 00),
(13, 2, 0, 2, 0, 7, 1, 15, 00),
(14, 1, 0, 1, 0, 1, 0, 16, 00),
(15, 1, 0, 1, 0, 0, 0, 17, 00),
(16, 1, 1, 0, 0, 2, 0, 18, 01),
(17, 2, 1, 0, 1, 2, 2, 19, 01),
(18, 3, 0, 2, 1, 6, 0, 20, 00),
(19, 1, 0, 0, 1, 1, 0, 21, 00),
(20, 1, 0, 1, 0, 1, 0, 22, 00),
(21, 1, 0, 1, 0, 3, 0, 23, 00),
(22, 1, 0, 1, 0, 0, 0, 24, 00),
(23, 1, 1, 0, 0, 5, 0, 25, 01),
(24, 1, 0, 1, 0, 1, 2, 26, 00),
(25, 0, 0, 0, 0, 0, 0, 28, 00),
(26, 0, 0, 0, 0, 0, 0, 29, 00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `eventos`
--

CREATE TABLE `eventos` (
  `ID_EVENTOS` int(1) UNSIGNED NOT NULL,
  `DESCRIPCION` varchar(12) CHARACTER SET utf8 COLLATE utf8_spanish_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `eventos`
--

INSERT INTO `eventos` (`ID_EVENTOS`, `DESCRIPCION`) VALUES
(1, 'GOL'),
(2, 'ASISTENCIA'),
(3, 'CAMBIO JUGAD'),
(4, 'PENAL'),
(5, 'PRESENTE'),
(5, 'TIRO LIBRE'),
(6, 'NGNA');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jugadores`
--

CREATE TABLE `jugadores` (
  `ID_JUGADORES` int(3) UNSIGNED NOT NULL,
  `NOMBRE` varchar(20) CHARACTER SET utf8 COLLATE utf8_spanish_ci DEFAULT NULL,
  `AVATAR_URL` varchar(255) DEFAULT '/imagenes/avatares/default.png',
  `CLAVE` varchar(266) CHARACTER SET utf8 COLLATE utf8_spanish_ci NOT NULL,
  `ROL` int(1) UNSIGNED NOT NULL,
  `VALOR_ELO` int(4) NOT NULL DEFAULT 1000
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `jugadores`
--

INSERT INTO `jugadores` (`ID_JUGADORES`, `NOMBRE`, `AVATAR_URL`, `CLAVE`, `ROL`, `VALOR_ELO`) VALUES
(1, 'Brandon', '../images/avatares/avatarMessi.png', '$2y$10$iKIRvMDZpzZnWwYoBFsQnuQ8xAeBBtoXS3.cDCz7Osp6kGBEQpXz6', 1, 1300),
(2, 'Rama', '../images/avatares/default.png', '$2y$10$QWiFXKJNYt81kb6ocCcCfOKCDso7d.snoPNR4EBoCSzLM4R/8z3Te', 1, 1250),
(3, 'Chanchi', '/imagenes/avatares/default.png', '1234', 1, 1100),
(4, 'Loto', '/imagenes/avatares/default.png', '1234', 1, 1200),
(5, 'Chapa', '/imagenes/avatares/default.png', '1234', 1, 1050),
(6, 'Nico', '/imagenes/avatares/default.png', '1234', 1, 1275),
(7, 'Chiwi', '/imagenes/avatares/default.png', '1234', 1, 1000),
(8, 'Pipi', '/imagenes/avatares/default.png', '1234', 1, 950),
(9, 'Arbol', '/imagenes/avatares/default.png', '1234', 9, 1060),
(10, 'Mateo', '/imagenes/avatares/default.png', '1234', 1, 1150),
(11, 'Goofy', '/imagenes/avatares/default.png', '1234', 1, 0),
(14, 'Juanchi', '/imagenes/avatares/default.png', '1234', 1, 0),
(15, 'ByViruzz', '/imagenes/avatares/default.png', '1234', 1, 0),
(16, 'ColoPerez', '/imagenes/avatares/default.png', '1234', 1, 0),
(17, 'TobiLED', '/imagenes/avatares/default.png', '1234', 1, 0),
(18, 'MyM', '/imagenes/avatares/default.png', '1234', 1, 0),
(19, 'Dylan', '/imagenes/avatares/default.png', '1234', 1, 0),
(20, 'Santi', '/imagenes/avatares/default.png', '1234', 1, 0),
(21, 'Diego', '/imagenes/avatares/default.png', '1234', 1, 0),
(22, 'Almidonte', '/imagenes/avatares/default.png', '1234', 1, 0),
(23, 'R1', '/imagenes/avatares/default.png', '1234', 1, 0),
(24, 'R2', '/imagenes/avatares/default.png', '1234', 1, 0),
(25, 'BautiTwink', '/imagenes/avatares/default.png', '1234', 1, 0),
(26, 'Batata', '/imagenes/avatares/default.png', '1234', 1, 0),
(28, 'Horacio', '../images/avatares/default-avatar.png', '$2y$10$ShFHurJuBmXPY3qCnqm.JO524fsU2csJ25.He7DCBLhiUiiS9OsN.', 1, 1200),
(29, 'Valentin', '../images/avatares/default-avatar.png', '$2y$10$sX6/Fj0XPvD1WB3F1GLbcO02NqCstfzo36zfS6.f1vPYT1O/eov9G', 1, 1200);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `partidos`
--

CREATE TABLE `partidos` (
  `ID_PARTIDOS` int(3) UNSIGNED NOT NULL,
  `FECHA_PARTIDO` date NOT NULL,
  `FORMATO` varchar(3) NOT NULL,
  `CANCHA_PARTIDO` int(1) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `partidos`
--

INSERT INTO `partidos` (`ID_PARTIDOS`, `FECHA_PARTIDO`, `FORMATO`, `CANCHA_PARTIDO`) VALUES
(0, '2026-06-20', 'F5', 3),
(1, '2026-02-17', 'F5', 1),
(2, '2026-02-27', 'F5', 1),
(3, '2026-03-06', 'F5', 1),
(4, '2026-03-13', 'F5', 1),
(5, '2026-04-17', 'F5', 1),
(6, '2026-05-17', 'F5', 2),
(7, '2026-06-05', 'F5', 1),
(8, '2026-06-20', 'F5', 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recolector_eventos`
--

CREATE TABLE `recolector_eventos` (
  `ID_RECOLECTOR` int(5) UNSIGNED NOT NULL,
  `ID_PARTIDO` int(3) UNSIGNED NOT NULL,
  `ID_JUGADOR_EVENTO` int(3) UNSIGNED NOT NULL,
  `ID_EVENTO_PARTIDO` int(1) UNSIGNED NOT NULL,
  `EQUIPO_EVENTO` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `recolector_eventos`
--

INSERT INTO `recolector_eventos` (`ID_RECOLECTOR`, `ID_PARTIDO`, `ID_JUGADOR_EVENTO`, `ID_EVENTO_PARTIDO`, `EQUIPO_EVENTO`) VALUES
(1, 1, 1, 1, 1),
(2, 1, 1, 1, 1),
(3, 1, 1, 1, 1),
(4, 1, 1, 1, 1),
(5, 1, 1, 1, 1),
(6, 1, 1, 2, 1),
(7, 1, 4, 1, 1),
(8, 1, 4, 1, 1),
(9, 1, 4, 1, 1),
(10, 1, 4, 1, 1),
(11, 1, 4, 2, 1),
(12, 1, 3, 1, 1),
(13, 1, 11, 2, 1),
(14, 1, 11, 2, 1),
(15, 1, 11, 2, 1),
(16, 1, 9, 2, 1),
(17, 1, 6, 2, 2),
(18, 1, 14, 1, 2),
(19, 1, 14, 1, 2),
(20, 1, 15, 1, 2),
(21, 1, 15, 1, 2),
(22, 1, 15, 1, 2),
(23, 1, 16, 1, 2),
(24, 1, 17, 6, 2),
(25, 2, 6, 1, 1),
(26, 2, 14, 1, 1),
(27, 2, 9, 1, 1),
(28, 2, 9, 1, 1),
(29, 2, 10, 1, 1),
(30, 2, 10, 1, 1),
(31, 2, 18, 1, 1),
(32, 2, 18, 1, 1),
(33, 2, 11, 1, 2),
(34, 2, 11, 1, 2),
(35, 2, 11, 1, 2),
(36, 2, 11, 2, 2),
(37, 2, 3, 1, 2),
(38, 2, 3, 1, 2),
(39, 2, 3, 2, 2),
(40, 2, 8, 2, 2),
(41, 2, 4, 1, 2),
(42, 2, 4, 2, 2),
(43, 2, 2, 6, 2),
(44, 3, 1, 1, 1),
(45, 3, 1, 1, 1),
(46, 3, 1, 2, 1),
(47, 3, 1, 2, 1),
(48, 3, 11, 1, 1),
(49, 3, 11, 1, 1),
(50, 3, 11, 2, 1),
(51, 3, 11, 2, 1),
(52, 3, 3, 1, 1),
(53, 3, 3, 2, 1),
(54, 3, 4, 1, 1),
(55, 3, 4, 1, 1),
(56, 3, 4, 2, 1),
(57, 3, 4, 2, 1),
(58, 3, 4, 2, 1),
(59, 3, 5, 1, 1),
(60, 3, 5, 1, 1),
(61, 3, 6, 6, 2),
(62, 3, 7, 1, 2),
(63, 3, 7, 1, 2),
(64, 3, 8, 1, 2),
(65, 3, 8, 1, 2),
(66, 3, 8, 1, 2),
(67, 3, 8, 1, 2),
(68, 3, 9, 2, 2),
(69, 3, 10, 1, 2),
(70, 3, 10, 2, 2),
(71, 3, 10, 2, 2),
(72, 4, 6, 6, 1),
(73, 4, 3, 1, 1),
(74, 4, 3, 2, 1),
(75, 4, 4, 2, 1),
(76, 4, 7, 1, 1),
(77, 4, 7, 1, 1),
(78, 4, 7, 1, 1),
(79, 4, 25, 1, 1),
(80, 4, 25, 1, 1),
(81, 4, 25, 1, 1),
(82, 4, 25, 1, 1),
(83, 4, 25, 1, 1),
(84, 4, 1, 1, 2),
(85, 4, 1, 1, 2),
(86, 4, 1, 1, 2),
(87, 4, 1, 2, 2),
(88, 4, 11, 1, 2),
(89, 4, 11, 2, 2),
(90, 4, 8, 1, 2),
(91, 4, 8, 1, 2),
(92, 4, 8, 1, 2),
(93, 4, 8, 1, 2),
(94, 4, 9, 2, 2),
(95, 4, 9, 2, 2),
(96, 4, 2, 2, 2),
(97, 5, 9, 1, 1),
(98, 5, 9, 1, 1),
(99, 5, 9, 1, 1),
(100, 5, 9, 2, 1),
(101, 5, 7, 1, 1),
(102, 5, 7, 1, 1),
(103, 5, 7, 2, 1),
(104, 5, 20, 1, 1),
(105, 5, 19, 1, 1),
(106, 5, 19, 2, 1),
(107, 5, 21, 1, 1),
(108, 5, 11, 1, 2),
(109, 5, 11, 1, 2),
(110, 5, 11, 1, 2),
(111, 5, 3, 1, 2),
(112, 5, 3, 2, 2),
(113, 5, 6, 2, 2),
(114, 5, 6, 2, 2),
(115, 5, 8, 1, 2),
(116, 5, 8, 1, 2),
(117, 5, 8, 1, 2),
(118, 5, 8, 1, 2),
(119, 5, 4, 6, 2),
(120, 6, 11, 1, 1),
(121, 6, 11, 1, 1),
(122, 6, 11, 2, 1),
(123, 6, 3, 1, 1),
(124, 6, 3, 1, 1),
(125, 6, 3, 1, 1),
(126, 6, 6, 1, 1),
(127, 6, 9, 1, 1),
(128, 6, 9, 1, 1),
(129, 6, 9, 1, 1),
(130, 6, 9, 2, 1),
(131, 6, 4, 1, 1),
(132, 6, 4, 1, 1),
(133, 6, 4, 2, 1),
(134, 6, 4, 2, 1),
(135, 6, 1, 2, 2),
(136, 6, 8, 6, 2),
(137, 6, 14, 1, 2),
(138, 6, 15, 1, 2),
(139, 6, 15, 1, 2),
(140, 6, 15, 1, 2),
(141, 6, 15, 1, 2),
(142, 6, 15, 2, 2),
(143, 6, 22, 1, 2),
(144, 7, 1, 1, 1),
(145, 7, 1, 1, 1),
(146, 7, 1, 2, 1),
(147, 7, 1, 2, 1),
(148, 7, 1, 2, 1),
(149, 7, 1, 2, 1),
(150, 7, 11, 1, 1),
(151, 7, 11, 1, 1),
(152, 7, 11, 1, 1),
(153, 7, 11, 2, 1),
(154, 7, 3, 1, 1),
(155, 7, 3, 1, 1),
(156, 7, 3, 2, 1),
(157, 7, 8, 1, 1),
(158, 7, 8, 1, 1),
(159, 7, 8, 2, 1),
(160, 7, 9, 1, 1),
(161, 7, 9, 1, 1),
(162, 7, 6, 6, 2),
(163, 7, 4, 1, 2),
(164, 7, 20, 1, 2),
(165, 7, 20, 1, 2),
(166, 7, 20, 1, 2),
(167, 7, 23, 1, 2),
(168, 7, 23, 1, 2),
(169, 7, 23, 1, 2),
(170, 7, 24, 6, 2),
(171, 8, 1, 1, 1),
(172, 8, 1, 1, 1),
(173, 8, 1, 1, 1),
(174, 8, 1, 1, 1),
(175, 8, 1, 1, 1),
(176, 8, 1, 2, 1),
(177, 8, 1, 2, 1),
(178, 8, 2, 1, 1),
(179, 8, 19, 1, 1),
(180, 8, 19, 2, 1),
(181, 8, 9, 1, 1),
(182, 8, 9, 2, 1),
(183, 8, 9, 2, 1),
(184, 8, 8, 1, 1),
(185, 8, 8, 2, 1),
(186, 8, 8, 2, 1),
(187, 8, 4, 1, 2),
(188, 8, 4, 1, 2),
(189, 8, 6, 6, 2),
(190, 8, 14, 1, 2),
(191, 8, 3, 1, 2),
(192, 8, 3, 2, 2),
(193, 8, 26, 1, 2),
(194, 8, 26, 2, 2),
(195, 8, 26, 2, 2),
(196, 8, 20, 1, 2),
(197, 8, 20, 1, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `ID_ROLES` int(1) UNSIGNED NOT NULL,
  `ROL_DESCRIPCION` varchar(18) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`ID_ROLES`, `ROL_DESCRIPCION`) VALUES
(1, 'JUGADOR'),
(9, 'DEV');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contactos`
--

CREATE TABLE `contactos` (
  `ID_CONTACTOS` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `NOMBRE` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `CORREO_ELECTRONICO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `ASUNTO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `MENSAJE` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  PRIMARY KEY (`ID_CONTACTOS`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- --------------------------------------------------------

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `canchas`
--
ALTER TABLE `canchas`
  ADD PRIMARY KEY (`ID_CANCHA`);

--
-- Indices de la tabla `estadisticas`
--
ALTER TABLE `estadisticas`
  ADD PRIMARY KEY (`ID_ESTADISTICAS`),
  ADD KEY `ID_JUGADOR` (`ID_JUGADOR`);

--
-- Indices de la tabla `eventos`
--
ALTER TABLE `eventos`
  ADD PRIMARY KEY (`ID_EVENTOS`);

--
-- Indices de la tabla `jugadores`
--
ALTER TABLE `jugadores`
  ADD PRIMARY KEY (`ID_JUGADORES`),
  ADD UNIQUE KEY `NOMBRE` (`NOMBRE`),
  ADD KEY `ROL` (`ROL`);

--
-- Indices de la tabla `partidos`
--
ALTER TABLE `partidos`
  ADD PRIMARY KEY (`ID_PARTIDOS`),
  ADD KEY `CANCHA_PARTIDO` (`CANCHA_PARTIDO`);

--
-- Indices de la tabla `recolector_eventos`
--
ALTER TABLE `recolector_eventos`
  ADD PRIMARY KEY (`ID_RECOLECTOR`),
  ADD KEY `ID_JUGADOR_EVENTO` (`ID_JUGADOR_EVENTO`),
  ADD KEY `ID_EVENTO_PARTIDO` (`ID_EVENTO_PARTIDO`),
  ADD KEY `ID_PARTIDO` (`ID_PARTIDO`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`ID_ROLES`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `canchas`
--
ALTER TABLE `canchas`
  MODIFY `ID_CANCHA` int(1) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `estadisticas`
--
ALTER TABLE `estadisticas`
  MODIFY `ID_ESTADISTICAS` int(3) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de la tabla `eventos`
--
ALTER TABLE `eventos`
  MODIFY `ID_EVENTOS` int(1) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `jugadores`
--
ALTER TABLE `jugadores`
  MODIFY `ID_JUGADORES` int(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT de la tabla `partidos`
--
ALTER TABLE `partidos`
  MODIFY `ID_PARTIDOS` int(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `recolector_eventos`
--
ALTER TABLE `recolector_eventos`
  MODIFY `ID_RECOLECTOR` int(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=198;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `ID_ROLES` int(1) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `contactos`
--
ALTER TABLE `contactos`
  MODIFY `id_contactos` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `estadisticas`
--
ALTER TABLE `estadisticas`
  ADD CONSTRAINT `estadisticas_ibfk_1` FOREIGN KEY (`ID_JUGADOR`) REFERENCES `jugadores` (`ID_JUGADORES`);

--
-- Filtros para la tabla `jugadores`
--
ALTER TABLE `jugadores`
  ADD CONSTRAINT `jugadores_ibfk_1` FOREIGN KEY (`ROL`) REFERENCES `roles` (`ID_ROLES`);

--
-- Filtros para la tabla `partidos`
--
ALTER TABLE `partidos`
  ADD CONSTRAINT `partidos_ibfk_1` FOREIGN KEY (`CANCHA_PARTIDO`) REFERENCES `canchas` (`ID_CANCHA`);

--
-- Filtros para la tabla `recolector_eventos`
--
ALTER TABLE `recolector_eventos`
  ADD CONSTRAINT `recolector_eventos_ibfk_1` FOREIGN KEY (`ID_JUGADOR_EVENTO`) REFERENCES `jugadores` (`ID_JUGADORES`),
  ADD CONSTRAINT `recolector_eventos_ibfk_2` FOREIGN KEY (`ID_EVENTO_PARTIDO`) REFERENCES `eventos` (`ID_EVENTOS`),
  ADD CONSTRAINT `recolector_eventos_ibfk_3` FOREIGN KEY (`ID_PARTIDO`) REFERENCES `partidos` (`ID_PARTIDOS`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
