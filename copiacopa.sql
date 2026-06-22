-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 23-06-2026 a las 00:47:01
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
CREATE DATABASE IF NOT EXISTS `copa` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci;
USE `copa`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `canchas`
--

CREATE TABLE `canchas` (
  `ID_CANCHA` int(1) UNSIGNED NOT NULL,
  `NOMBRE` varchar(30) CHARACTER SET utf8 COLLATE utf8_spanish_ci DEFAULT NULL,
  `DIRECCION` varchar(30) CHARACTER SET utf8 COLLATE utf8_spanish_ci NOT NULL,
  `LOCALIDAD` varchar(30) CHARACTER SET utf8 COLLATE utf8_spanish_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `canchas`
--

INSERT INTO `canchas` (`ID_CANCHA`, `NOMBRE`, `DIRECCION`, `LOCALIDAD`) VALUES
(1, 'MEGA FUTBOL', 'Rincon 2875', 'San Justo'),
(2, 'Mistica Deportes (EX Galpon)', 'Sgto. Cabral 1563', 'Ramos Mejía');

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
(5, 'TIRO LIBRE'),
(6, 'NGNA');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jugadores`
--

CREATE TABLE `jugadores` (
  `ID_JUGADORES` int(3) UNSIGNED NOT NULL,
  `NOMBRE` varchar(20) CHARACTER SET utf8 COLLATE utf8_spanish_ci DEFAULT NULL,
  `CLAVE` varchar(266) CHARACTER SET utf8 COLLATE utf8_spanish_ci NOT NULL,
  `ROL` int(1) UNSIGNED NOT NULL,
  `VALOR_ELO` decimal(3,0) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `jugadores`
--

INSERT INTO `jugadores` (`ID_JUGADORES`, `NOMBRE`, `CLAVE`, `ROL`, `VALOR_ELO`) VALUES
(1, 'Brandon', '1234', 1, 0),
(2, 'Rama', '1234', 1, 0),
(3, 'Chanchi', '1234', 1, 0),
(4, 'Loto', '1234', 1, 0),
(5, 'Chapa', '1234', 1, 0),
(6, 'Nico', '1234', 1, 0),
(7, 'Chiwi', '1234', 1, 0),
(8, 'Pipi', '1234', 1, 0),
(9, 'Arbol', '1234', 1, 0),
(10, 'Mateo', '1234', 1, 0),
(11, 'Goofy', '1234', 1, 0),
(14, 'Juanchi', '1234', 1, 0),
(15, 'ByViruzz', '1234', 1, 0),
(16, 'ColoPerez', '1234', 1, 0),
(17, 'TobiLED', '1234', 1, 0),
(18, 'MyM', '1234', 1, 0),
(19, 'Dylan', '1234', 1, 0),
(20, 'Santi', '1234', 1, 0),
(21, 'Diego', '1234', 1, 0),
(22, 'Almidonte', '1234', 1, 0),
(23, 'R1', '1234', 1, 0),
(24, 'R2', '1234', 1, 0),
(25, 'BautiTwink', '1234', 1, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `partidos`
--

CREATE TABLE `partidos` (
  `ID_PARTIDOS` int(3) NOT NULL,
  `FECHA_PARTIDO` date NOT NULL,
  `FORMATO` int(1) UNSIGNED NOT NULL,
  `CANCHA_PARTIDO` int(1) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recolector_eventos`
--

CREATE TABLE `recolector_eventos` (
  `ID_RECOLECTOR` int(5) UNSIGNED NOT NULL,
  `ID_PARTIDO` int(3) UNSIGNED NOT NULL,
  `FECHA` date NOT NULL,
  `ID_JUGADOR_EVENTO` int(3) UNSIGNED NOT NULL,
  `ID_EVENTO_PARTIDO` int(1) UNSIGNED NOT NULL,
  `EQUIPO_EVENTO` int(1) NOT NULL,
  `DIRECCION_PARTIDO` int(1) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `recolector_eventos`
--

INSERT INTO `recolector_eventos` (`ID_RECOLECTOR`, `ID_PARTIDO`, `FECHA`, `ID_JUGADOR_EVENTO`, `ID_EVENTO_PARTIDO`, `EQUIPO_EVENTO`, `DIRECCION_PARTIDO`) VALUES
(1, 1, '2026-02-17', 1, 1, 1, 1),
(2, 1, '2026-02-17', 1, 1, 1, 1),
(3, 1, '2026-02-17', 1, 1, 1, 1),
(4, 1, '2026-02-17', 1, 1, 1, 1),
(5, 1, '2026-02-17', 1, 1, 1, 1),
(6, 1, '2026-02-17', 1, 2, 1, 1),
(7, 1, '2026-02-17', 4, 1, 1, 1),
(8, 1, '2026-02-17', 4, 1, 1, 1),
(9, 1, '2026-02-17', 4, 1, 1, 1),
(10, 1, '2026-02-17', 4, 1, 1, 1),
(11, 1, '2026-02-17', 4, 2, 1, 1),
(12, 1, '2026-02-17', 3, 1, 1, 1),
(13, 1, '2026-02-17', 11, 2, 1, 1),
(14, 1, '2026-02-17', 11, 2, 1, 1),
(15, 1, '2026-02-17', 11, 2, 1, 1),
(16, 1, '2026-02-17', 9, 2, 1, 1),
(17, 1, '2026-02-17', 6, 2, 2, 1),
(18, 1, '2026-02-17', 14, 1, 2, 1),
(19, 1, '2026-02-17', 14, 1, 2, 1),
(20, 1, '2026-02-17', 15, 1, 2, 1),
(21, 1, '2026-02-17', 15, 1, 2, 1),
(22, 1, '2026-02-17', 15, 1, 2, 1),
(23, 1, '2026-02-17', 16, 1, 2, 1),
(24, 1, '2026-02-17', 17, 6, 2, 1),
(25, 2, '2026-02-27', 6, 1, 1, 1),
(26, 2, '2026-02-27', 14, 1, 1, 1),
(27, 2, '2026-02-27', 9, 1, 1, 1),
(28, 2, '2026-02-27', 9, 1, 1, 1),
(29, 2, '2026-02-27', 10, 1, 1, 1),
(30, 2, '2026-02-27', 10, 1, 1, 1),
(31, 2, '2026-02-27', 18, 1, 1, 1),
(32, 2, '2026-02-27', 18, 1, 1, 1),
(33, 2, '2026-02-27', 11, 1, 2, 1),
(34, 2, '2026-02-27', 11, 1, 2, 1),
(35, 2, '2026-02-27', 11, 1, 2, 1),
(36, 2, '2026-02-27', 11, 2, 2, 1),
(37, 2, '2026-02-27', 3, 1, 2, 1),
(38, 2, '2026-02-27', 3, 1, 2, 1),
(39, 2, '2026-02-27', 3, 2, 2, 1),
(40, 2, '2026-02-27', 8, 2, 2, 1),
(41, 2, '2026-02-27', 4, 1, 2, 1),
(42, 2, '2026-02-27', 4, 2, 2, 1),
(43, 2, '2026-02-27', 2, 6, 2, 1),
(44, 3, '2026-03-06', 1, 1, 1, 1),
(45, 3, '2026-03-06', 1, 1, 1, 1),
(46, 3, '2026-03-06', 1, 2, 1, 1),
(47, 3, '2026-03-06', 1, 2, 1, 1),
(48, 3, '2026-03-06', 11, 1, 1, 1),
(49, 3, '2026-03-06', 11, 1, 1, 1),
(50, 3, '2026-03-06', 11, 2, 1, 1),
(51, 3, '2026-03-06', 11, 2, 1, 1),
(52, 3, '2026-03-06', 3, 1, 1, 1),
(53, 3, '2026-03-06', 3, 2, 1, 1),
(54, 3, '2026-03-06', 4, 1, 1, 1),
(55, 3, '2026-03-06', 4, 1, 1, 1),
(56, 3, '2026-03-06', 4, 2, 1, 1),
(57, 3, '2026-03-06', 4, 2, 1, 1),
(58, 3, '2026-03-06', 4, 2, 1, 1),
(59, 3, '2026-03-06', 5, 1, 1, 1),
(60, 3, '2026-03-06', 5, 1, 1, 1),
(61, 3, '2026-03-06', 6, 6, 2, 1),
(62, 3, '2026-03-06', 7, 1, 2, 1),
(63, 3, '2026-03-06', 7, 1, 2, 1),
(64, 3, '2026-03-06', 8, 1, 2, 1),
(65, 3, '2026-03-06', 8, 1, 2, 1),
(66, 3, '2026-03-06', 8, 1, 2, 1),
(67, 3, '2026-03-06', 8, 1, 2, 1),
(68, 3, '2026-03-06', 9, 2, 2, 1),
(69, 3, '2026-03-06', 10, 1, 2, 1),
(70, 3, '2026-03-06', 10, 2, 2, 1),
(71, 3, '2026-03-06', 10, 2, 2, 1),
(72, 4, '2026-03-13', 6, 6, 1, 1),
(73, 4, '2026-03-13', 3, 1, 1, 1),
(74, 4, '2026-03-13', 3, 2, 1, 1),
(75, 4, '2026-03-13', 4, 2, 1, 1),
(76, 4, '2026-03-13', 7, 1, 1, 1),
(77, 4, '2026-03-13', 7, 1, 1, 1),
(78, 4, '2026-03-13', 7, 1, 1, 1),
(79, 4, '2026-03-13', 25, 1, 1, 1),
(80, 4, '2026-03-13', 25, 1, 1, 1),
(81, 4, '2026-03-13', 25, 1, 1, 1),
(82, 4, '2026-03-13', 25, 1, 1, 1),
(83, 4, '2026-03-13', 25, 1, 1, 1),
(84, 4, '2026-03-13', 1, 1, 2, 1),
(85, 4, '2026-03-13', 1, 1, 2, 1),
(86, 4, '2026-03-13', 1, 1, 2, 1),
(87, 4, '2026-03-13', 1, 2, 2, 1),
(88, 4, '2026-03-13', 11, 1, 2, 1),
(89, 4, '2026-03-13', 11, 2, 2, 1),
(90, 4, '2026-03-13', 8, 1, 2, 1),
(91, 4, '2026-03-13', 8, 1, 2, 1),
(92, 4, '2026-03-13', 8, 1, 2, 1),
(93, 4, '2026-03-13', 8, 1, 2, 1),
(94, 4, '2026-03-13', 9, 2, 2, 1),
(95, 4, '2026-03-13', 9, 2, 2, 1),
(96, 4, '2026-03-13', 2, 2, 2, 1),
(97, 5, '2026-04-17', 9, 1, 1, 1),
(98, 5, '2026-04-17', 9, 1, 1, 1),
(99, 5, '2026-04-17', 9, 1, 1, 1),
(100, 5, '2026-04-17', 9, 2, 1, 1),
(101, 5, '2026-04-17', 7, 1, 1, 1),
(102, 5, '2026-04-17', 7, 1, 1, 1),
(103, 5, '2026-04-17', 7, 2, 1, 1),
(104, 5, '2026-04-17', 20, 1, 1, 1),
(105, 5, '2026-04-17', 19, 1, 1, 1),
(106, 5, '2026-04-17', 19, 2, 1, 1),
(107, 5, '2026-04-17', 21, 1, 1, 1),
(108, 5, '2026-04-17', 11, 1, 2, 1),
(109, 5, '2026-04-17', 11, 1, 2, 1),
(110, 5, '2026-04-17', 11, 1, 2, 1),
(111, 5, '2026-04-17', 3, 1, 2, 1),
(112, 5, '2026-04-17', 3, 2, 2, 1),
(113, 5, '2026-04-17', 6, 2, 2, 1),
(114, 5, '2026-04-17', 6, 2, 2, 1),
(115, 5, '2026-04-17', 8, 1, 2, 1),
(116, 5, '2026-04-17', 8, 1, 2, 1),
(117, 5, '2026-04-17', 8, 1, 2, 1),
(118, 5, '2026-04-17', 8, 1, 2, 1),
(119, 5, '2026-04-17', 4, 6, 2, 1),
(120, 6, '2026-05-17', 11, 1, 1, 2),
(121, 6, '2026-05-17', 11, 1, 1, 2),
(122, 6, '2026-05-17', 11, 2, 1, 2),
(123, 6, '2026-05-17', 3, 1, 1, 2),
(124, 6, '2026-05-17', 3, 1, 1, 2),
(125, 6, '2026-05-17', 3, 1, 1, 2),
(126, 6, '2026-05-17', 6, 1, 1, 2),
(127, 6, '2026-05-17', 9, 1, 1, 2),
(128, 6, '2026-05-17', 9, 1, 1, 2),
(129, 6, '2026-05-17', 9, 1, 1, 2),
(130, 6, '2026-05-17', 9, 2, 1, 2),
(131, 6, '2026-05-17', 4, 1, 1, 2),
(132, 6, '2026-05-17', 4, 1, 1, 2),
(133, 6, '2026-05-17', 4, 2, 1, 2),
(134, 6, '2026-05-17', 4, 2, 1, 2),
(135, 6, '2026-05-17', 1, 2, 2, 2),
(136, 6, '2026-05-17', 8, 6, 2, 2),
(137, 6, '2026-05-17', 14, 1, 2, 2),
(138, 6, '2026-05-17', 15, 1, 2, 2),
(139, 6, '2026-05-17', 15, 1, 2, 2),
(140, 6, '2026-05-17', 15, 1, 2, 2),
(141, 6, '2026-05-17', 15, 1, 2, 2),
(142, 6, '2026-05-17', 15, 2, 2, 2),
(143, 6, '2026-05-17', 22, 1, 2, 2),
(144, 7, '2026-06-05', 1, 1, 1, 1),
(145, 7, '2026-06-05', 1, 1, 1, 1),
(146, 7, '2026-06-05', 1, 2, 1, 1),
(147, 7, '2026-06-05', 1, 2, 1, 1),
(148, 7, '2026-06-05', 1, 2, 1, 1),
(149, 7, '2026-06-05', 1, 2, 1, 1),
(150, 7, '2026-06-05', 11, 1, 1, 1),
(151, 7, '2026-06-05', 11, 1, 1, 1),
(152, 7, '2026-06-05', 11, 1, 1, 1),
(153, 7, '2026-06-05', 11, 2, 1, 1),
(154, 7, '2026-06-05', 3, 1, 1, 1),
(155, 7, '2026-06-05', 3, 1, 1, 1),
(156, 7, '2026-06-05', 3, 2, 1, 1),
(157, 7, '2026-06-05', 8, 1, 1, 1),
(158, 7, '2026-06-05', 8, 1, 1, 1),
(159, 7, '2026-06-05', 8, 2, 1, 1),
(160, 7, '2026-06-05', 9, 1, 1, 1),
(161, 7, '2026-06-05', 9, 1, 1, 1),
(162, 7, '2026-06-05', 6, 6, 2, 1),
(163, 7, '2026-06-05', 4, 1, 2, 1),
(164, 7, '2026-06-05', 20, 1, 2, 1),
(165, 7, '2026-06-05', 20, 1, 2, 1),
(166, 7, '2026-06-05', 20, 1, 2, 1),
(167, 7, '2026-06-05', 23, 1, 2, 1),
(168, 7, '2026-06-05', 23, 1, 2, 1),
(169, 7, '2026-06-05', 23, 1, 2, 1),
(170, 7, '2026-06-05', 24, 6, 2, 1);

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
  ADD PRIMARY KEY (`ID_PARTIDOS`);

--
-- Indices de la tabla `recolector_eventos`
--
ALTER TABLE `recolector_eventos`
  ADD PRIMARY KEY (`ID_RECOLECTOR`),
  ADD KEY `ID_JUGADOR_EVENTO` (`ID_JUGADOR_EVENTO`),
  ADD KEY `ID_EVENTO_PARTIDO` (`ID_EVENTO_PARTIDO`),
  ADD KEY `DIRECCION_PARTIDO` (`DIRECCION_PARTIDO`);

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
  MODIFY `ID_CANCHA` int(1) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `estadisticas`
--
ALTER TABLE `estadisticas`
  MODIFY `ID_ESTADISTICAS` int(3) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `eventos`
--
ALTER TABLE `eventos`
  MODIFY `ID_EVENTOS` int(1) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `jugadores`
--
ALTER TABLE `jugadores`
  MODIFY `ID_JUGADORES` int(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `partidos`
--
ALTER TABLE `partidos`
  MODIFY `ID_PARTIDOS` int(3) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `recolector_eventos`
--
ALTER TABLE `recolector_eventos`
  MODIFY `ID_RECOLECTOR` int(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=171;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `ID_ROLES` int(1) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

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
-- Filtros para la tabla `recolector_eventos`
--
ALTER TABLE `recolector_eventos`
  ADD CONSTRAINT `recolector_eventos_ibfk_1` FOREIGN KEY (`ID_JUGADOR_EVENTO`) REFERENCES `jugadores` (`ID_JUGADORES`),
  ADD CONSTRAINT `recolector_eventos_ibfk_2` FOREIGN KEY (`ID_EVENTO_PARTIDO`) REFERENCES `eventos` (`ID_EVENTOS`),
  ADD CONSTRAINT `recolector_eventos_ibfk_3` FOREIGN KEY (`DIRECCION_PARTIDO`) REFERENCES `canchas` (`ID_CANCHA`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
