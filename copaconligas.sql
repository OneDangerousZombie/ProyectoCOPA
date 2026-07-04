-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 03-07-2026 a las 17:46:49
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
-- Base de datos: `copatres`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `canchas`
--

CREATE TABLE `canchas` (
  `ID_CANCHA` int(5) UNSIGNED NOT NULL,
  `ID_LIGA` int(5) UNSIGNED NOT NULL,
  `NOMBRE` varchar(30) CHARACTER SET utf8 COLLATE utf8_spanish_ci DEFAULT NULL,
  `DIRECCION` varchar(100) CHARACTER SET utf8 COLLATE utf8_spanish_ci NOT NULL,
  `LOCALIDAD` varchar(256) CHARACTER SET utf8 COLLATE utf8_spanish_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `canchas`
--

INSERT INTO `canchas` (`ID_CANCHA`, `ID_LIGA`, `NOMBRE`, `DIRECCION`, `LOCALIDAD`) VALUES
(4, 1, 'MEGA FUTBOL', 'Rincon 2875', 'San Justo'),
(5, 1, 'Mistica Deportes (EX Galpon)', 'Sgto. Cabral 1563', 'Ramos Mejía'),
(6, 1, 'La Capilla', 'Colón 1485', 'Ramos Mejía');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contactos`
--

CREATE TABLE `contactos` (
  `id_contactos` int(11) UNSIGNED NOT NULL,
  `NOMBRE` varchar(100) NOT NULL,
  `CORREO_ELECTRONICO` varchar(255) NOT NULL,
  `ASUNTO` varchar(255) NOT NULL,
  `MENSAJE` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `contactos`
--

INSERT INTO `contactos` (`id_contactos`, `NOMBRE`, `CORREO_ELECTRONICO`, `ASUNTO`, `MENSAJE`) VALUES
(1, 'nashe', 'coscu@twitch.com', 'botines', 'encontre unos botines en la app, hay descuento insta?'),
(2, 'oliver', 'locoporelbalon@hotmail.com', 'tamaño de las canchas', 'las canchas que tienen son muy chicas, en japon nos gusta correr un banda. solucionen eso');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estadisticas`
--

CREATE TABLE `estadisticas` (
  `ID_ESTADISTICAS` int(10) NOT NULL,
  `ID_LIGA` int(5) UNSIGNED NOT NULL,
  `ID_USUARIO` int(10) UNSIGNED NOT NULL,
  `PARTIDOS_JUGADOS` int(4) UNSIGNED NOT NULL DEFAULT 0,
  `PARTIDOS_GANADOS` int(4) UNSIGNED NOT NULL DEFAULT 0,
  `PARTIDOS_PERDIDOS` int(4) UNSIGNED NOT NULL DEFAULT 0,
  `PARTIDOS_EMPATADOS` int(4) UNSIGNED NOT NULL DEFAULT 0,
  `GOLES` int(4) UNSIGNED NOT NULL DEFAULT 0,
  `ASISTENCIAS` int(4) UNSIGNED NOT NULL DEFAULT 0,
  `RACHA` int(2) UNSIGNED ZEROFILL NOT NULL DEFAULT 00,
  `ULTIMA_ACTUALIZACION` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `estadisticas`
--

INSERT INTO `estadisticas` (`ID_ESTADISTICAS`, `ID_LIGA`, `ID_USUARIO`, `PARTIDOS_JUGADOS`, `PARTIDOS_GANADOS`, `PARTIDOS_PERDIDOS`, `PARTIDOS_EMPATADOS`, `GOLES`, `ASISTENCIAS`, `RACHA`, `ULTIMA_ACTUALIZACION`) VALUES
(1, 1, 1, 16, 10, 2, 4, 29, 17, 08, '2026-07-02 19:38:53'),
(2, 1, 2, 8, 4, 3, 1, 5, 2, 03, '2026-07-02 19:38:53'),
(3, 1, 3, 15, 7, 5, 3, 16, 11, 00, '2026-07-02 19:38:53'),
(4, 1, 4, 13, 5, 4, 4, 15, 9, 00, '2026-07-03 11:11:34'),
(5, 1, 5, 7, 2, 1, 4, 6, 1, 01, '2026-07-02 19:38:53'),
(6, 1, 6, 12, 4, 5, 3, 5, 3, 00, '2026-07-03 11:11:34'),
(7, 1, 7, 13, 4, 5, 4, 14, 5, 00, '2026-07-02 19:38:53'),
(8, 1, 8, 12, 2, 7, 3, 20, 5, 00, '2026-07-03 11:11:34'),
(9, 1, 9, 11, 6, 3, 2, 12, 8, 01, '2026-07-03 11:11:34'),
(10, 1, 10, 2, 1, 1, 0, 3, 2, 00, '2026-07-02 19:38:53'),
(11, 1, 11, 10, 4, 2, 4, 15, 9, 02, '2026-07-02 19:38:53'),
(12, 1, 14, 8, 1, 5, 2, 5, 5, 00, '2026-07-03 11:11:34'),
(13, 1, 15, 7, 3, 3, 1, 8, 6, 00, '2026-07-02 19:38:53'),
(14, 1, 16, 5, 1, 1, 3, 3, 2, 01, '2026-07-03 11:11:34'),
(15, 1, 17, 2, 0, 1, 1, 1, 0, 00, '2026-07-02 19:38:53'),
(16, 1, 18, 1, 1, 0, 0, 2, 0, 01, '2026-07-02 19:38:53'),
(17, 1, 19, 6, 3, 0, 3, 5, 3, 03, '2026-07-02 19:38:53'),
(18, 1, 20, 3, 0, 2, 1, 6, 0, 00, '2026-07-02 19:38:53'),
(19, 1, 21, 4, 2, 0, 2, 4, 1, 02, '2026-07-02 19:38:53'),
(20, 1, 22, 10, 4, 2, 4, 9, 3, 00, '2026-07-02 19:38:53'),
(21, 1, 23, 2, 0, 1, 1, 3, 0, 00, '2026-07-03 11:11:34'),
(22, 1, 24, 3, 1, 2, 0, 2, 0, 01, '2026-07-02 19:38:53'),
(23, 1, 25, 8, 4, 2, 2, 10, 3, 00, '2026-07-02 19:38:53'),
(24, 1, 26, 12, 4, 4, 4, 7, 6, 01, '2026-07-02 19:38:53'),
(25, 1, 28, 2, 1, 1, 0, 2, 0, 00, '2026-07-02 19:38:53'),
(26, 1, 29, 1, 0, 1, 0, 1, 1, 00, '2026-07-02 19:38:53'),
(27, 1, 30, 4, 1, 1, 2, 2, 1, 01, '2026-07-02 19:38:53'),
(28, 1, 31, 3, 0, 1, 2, 2, 1, 00, '2026-07-03 11:11:34'),
(29, 1, 32, 3, 0, 1, 2, 2, 1, 00, '2026-07-02 19:38:53'),
(30, 1, 33, 0, 0, 0, 0, 0, 0, 00, '2026-07-02 19:38:53'),
(31, 1, 34, 2, 0, 0, 2, 0, 0, 00, '2026-07-03 11:11:34'),
(32, 1, 35, 0, 0, 0, 0, 0, 0, 00, '2026-07-02 19:38:53'),
(33, 1, 36, 2, 1, 0, 1, 2, 0, 01, '2026-07-02 19:38:53'),
(34, 4, 1, 0, 0, 0, 0, 0, 0, 00, '2026-07-02 20:29:04'),
(35, 4, 30, 0, 0, 0, 0, 0, 0, 00, '2026-07-02 20:29:30'),
(36, 5, 4, 0, 0, 0, 0, 0, 0, 00, '2026-07-02 20:31:13'),
(37, 4, 37, 0, 0, 0, 0, 0, 0, 00, '2026-07-02 21:04:23'),
(38, 5, 29, 0, 0, 0, 0, 0, 0, 00, '2026-07-02 23:48:51'),
(39, 4, 29, 0, 0, 0, 0, 0, 0, 00, '2026-07-03 09:46:31');

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
(6, 'NGNA'),
(9, 'PARTICIPA');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `invitaciones`
--

CREATE TABLE `invitaciones` (
  `ID_INVITACION` int(10) UNSIGNED NOT NULL,
  `ID_LIGA` int(5) UNSIGNED NOT NULL,
  `ID_INVITADO` int(10) UNSIGNED NOT NULL,
  `ID_INVITADO_POR` int(10) UNSIGNED NOT NULL,
  `ESTADO` tinyint(1) DEFAULT 0,
  `FECHA_ENVIO` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `MAIL` varchar(266) CHARACTER SET utf8 COLLATE utf8_spanish_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `jugadores`
--

INSERT INTO `jugadores` (`ID_JUGADORES`, `NOMBRE`, `AVATAR_URL`, `CLAVE`, `ROL`, `MAIL`) VALUES
(1, 'Brandon', 'https://tse1.mm.bing.net/th/id/OIP.i-t0Fp_In9FlSVvJc3h8VwHaE7?rs=1&pid=ImgDetMain&o=7&rm=3', '$2y$10$iKIRvMDZpzZnWwYoBFsQnuQ8xAeBBtoXS3.cDCz7Osp6kGBEQpXz6', 1, NULL),
(2, 'Rama', 'https://dailypost.ng/wp-content/uploads/2022/12/221013075544-01-patrick-vieira-file-scaled.jpg', '$2y$10$QWiFXKJNYt81kb6ocCcCfOKCDso7d.snoPNR4EBoCSzLM4R/8z3Te', 1, NULL),
(3, 'Chanchi', 'https://media.lacapital.com.ar/p/65f5b8343356343037ab39e9b25ebfa2/adjuntos/203/imagenes/030/530/0030530243/1200x675/smart/dillom1jpg.jpg', '$2y$10$taKc0gvbrh374zOwnGhcLudzMtSxasjFygsfLdyJsBcu3l2YGZz0a', 1, NULL),
(4, 'Loto', 'https://i.pinimg.com/originals/23/c5/ad/23c5adf06b9fc4b6325de63319932136.jpg?nii=t', '$2y$10$nQ9uOROq9LTAGmax9cENZ.1ZWmcIymUWSMGLzRy2mopbA/3hV72u6', 1, NULL),
(5, 'Chapa', 'https://tse2.mm.bing.net/th/id/OIP.n2iT7Up2crCbOJSvl1skQwHaEK?rs=1&pid=ImgDetMain&o=7&rm=3', '$2y$10$TS1ftHPPS57g4uzgZGYUOurNZCgjgyAvvyehWvw4qJM4hpQA5.iCa', 1, NULL),
(6, 'Nico', '/imagenes/avatares/default.png', '1234', 1, NULL),
(7, 'Chiwi', '/imagenes/avatares/default.png', '1234', 1, NULL),
(8, 'Pipi', '/imagenes/avatares/default.png', '1234', 1, NULL),
(9, 'Arbol', 'https://static0.gamerantimages.com/wordpress/wp-content/uploads/2021/11/Luffy.jpg', '$2y$10$L/cjKRpcVXnYpBQtAWVXPOecXN3bhZnzjPo3.1qjVX145Z/oVBCY.', 1, NULL),
(10, 'Mateo', '/imagenes/avatares/default.png', '1234', 1, NULL),
(11, 'Goofy', '/imagenes/avatares/default.png', '1234', 1, NULL),
(14, 'Juanchi', '/imagenes/avatares/default.png', '1234', 1, NULL),
(15, 'ByViruzz', '/imagenes/avatares/default.png', '1234', 1, NULL),
(16, 'ColoPerez', '/imagenes/avatares/default.png', '1234', 1, NULL),
(17, 'TobiLED', '/imagenes/avatares/default.png', '1234', 1, NULL),
(18, 'MyM', '/imagenes/avatares/default.png', '1234', 1, NULL),
(19, 'Dylan', '/imagenes/avatares/default.png', '1234', 1, NULL),
(20, 'Santi', '/imagenes/avatares/default.png', '1234', 1, NULL),
(21, 'Diego', '/imagenes/avatares/default.png', '1234', 1, NULL),
(22, 'Almidonte', '/imagenes/avatares/default.png', '1234', 1, NULL),
(23, 'R1', '/imagenes/avatares/default.png', '1234', 1, NULL),
(24, 'R2', '/imagenes/avatares/default.png', '1234', 1, NULL),
(25, 'BautiTwink', '/imagenes/avatares/default.png', '1234', 1, NULL),
(26, 'Batata', '/imagenes/avatares/default.png', '1234', 1, NULL),
(28, 'Horacio', 'https://media.tycsports.com/files/2020/11/27/157363/rugerri.jpg', '$2y$10$ShFHurJuBmXPY3qCnqm.JO524fsU2csJ25.He7DCBLhiUiiS9OsN.', 1, NULL),
(29, 'Valentin', '../images/avatares/default-avatar.png', '$2y$10$s8VtM3FX5BTF0LyX3YCOiOkKhXeB.MJ6nHEk9eXaxvn1/A/D/rllq', 9, NULL),
(30, 'Ardilla', '', '$2y$10$6Is.n4htr8CoinBotH3dwuQQq7/RLLOOfhiO6X5wTaoUQ5yEVAsrK', 1, NULL),
(31, 'Marto', '', '$2y$10$ujfsfBRTHhya3d7wgwdZX.hl7boe9JQ1X0xo3LbqdJVXuSFNs8Wtm', 1, NULL),
(32, 'Brændon', '', '$2y$10$Cl5nVrJTyDl9QVYP7I1uUuQNumKvsAzowcwVXWvhplDg5gmst45e.', 1, NULL),
(33, 'TomasLoto', '', '$2y$10$p1mPAIWUfCNxqEvqcoAEPO.htCrJjLeCwwKj797D00h7bA24G.fYG', 1, NULL),
(34, 'Dibruno Martinez', '', '$2y$10$IaZc0DkFCNMDIVpQAaRL6eiac/QcNkdspGPRwcmuCOi/Loq1qHNkO', 1, NULL),
(35, 'Zorro', '', '$2y$10$hIQjQdkTmDTZsKqN5kE9.e7AFu0P7.BdbXH4JDAVggmiUMEvnEC/S', 1, NULL),
(36, 'Melany', '', '$2y$10$SpV8gi16cLOBWDhqPS8f1OQEYg6110D5UHzUJk0FjzMYMb8zFiLy2', 1, NULL),
(37, 'LaFaraona', '', '$2y$10$1N483gu8XjDKmsxaBU8uZu5fHz5kcbB1ct2Owvrgjw9yzCs06mkX2', 1, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ligas`
--

CREATE TABLE `ligas` (
  `ID_LIGA` int(5) UNSIGNED NOT NULL,
  `NOMBRE` varchar(50) NOT NULL,
  `DESCRIPCION` text DEFAULT NULL,
  `ID_CREADOR` int(10) UNSIGNED NOT NULL,
  `FECHA_CREACION` date NOT NULL,
  `FORMATO_DEFAULT` varchar(3) DEFAULT 'F5',
  `PRIVADA` tinyint(1) DEFAULT 0,
  `CODIGO_INVITACION` varchar(10) DEFAULT NULL,
  `ESTADO` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ligas`
--

INSERT INTO `ligas` (`ID_LIGA`, `NOMBRE`, `DESCRIPCION`, `ID_CREADOR`, `FECHA_CREACION`, `FORMATO_DEFAULT`, `PRIVADA`, `CODIGO_INVITACION`, `ESTADO`) VALUES
(1, 'Liga Original', NULL, 1, '2026-01-01', 'F5', 0, NULL, 1),
(4, 'LIGA UTN', '', 1, '2026-07-02', 'F5', 0, '58KJX2', 1),
(5, 'LIGA LOTO', '', 4, '2026-07-02', 'F5', 1, '474BS4', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `liga_miembros`
--

CREATE TABLE `liga_miembros` (
  `ID_LIGA` int(5) UNSIGNED NOT NULL,
  `ID_USUARIO` int(10) UNSIGNED NOT NULL,
  `FECHA_UNION` datetime DEFAULT current_timestamp(),
  `ROL_LIGA` int(1) UNSIGNED NOT NULL,
  `VALOR_ELO` decimal(6,2) UNSIGNED NOT NULL DEFAULT 1000.00,
  `ACTIVO` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `liga_miembros`
--

INSERT INTO `liga_miembros` (`ID_LIGA`, `ID_USUARIO`, `FECHA_UNION`, `ROL_LIGA`, `VALOR_ELO`, `ACTIVO`) VALUES
(1, 1, '2026-07-02 17:15:55', 1, 987.20, 1),
(1, 2, '2026-07-02 17:15:55', 1, 1000.00, 1),
(1, 3, '2026-07-02 17:15:55', 1, 990.40, 1),
(1, 4, '2026-07-02 17:15:55', 1, 1038.36, 1),
(1, 5, '2026-07-02 17:15:55', 1, 987.20, 1),
(1, 6, '2026-07-02 17:15:55', 1, 987.24, 1),
(1, 7, '2026-07-02 17:15:55', 1, 987.20, 1),
(1, 8, '2026-07-02 17:15:55', 1, 1051.24, 1),
(1, 9, '2026-07-02 17:15:55', 1, 987.16, 1),
(1, 10, '2026-07-02 17:15:55', 1, 1000.00, 1),
(1, 11, '2026-07-02 17:15:55', 1, 1000.00, 1),
(1, 14, '2026-07-02 17:15:55', 1, 987.24, 1),
(1, 15, '2026-07-02 17:15:55', 1, 990.40, 1),
(1, 16, '2026-07-02 17:15:55', 1, 1006.36, 1),
(1, 17, '2026-07-02 17:15:55', 1, 1000.00, 1),
(1, 18, '2026-07-02 17:15:55', 1, 1000.00, 1),
(1, 19, '2026-07-02 17:15:55', 1, 1005.33, 1),
(1, 20, '2026-07-02 17:15:55', 1, 1000.00, 1),
(1, 21, '2026-07-02 17:15:55', 1, 1013.87, 1),
(1, 22, '2026-07-02 17:15:55', 1, 1051.20, 1),
(1, 23, '2026-07-02 17:15:55', 1, 987.24, 1),
(1, 24, '2026-07-02 17:15:55', 1, 1000.00, 1),
(1, 25, '2026-07-02 17:15:55', 1, 987.20, 1),
(1, 26, '2026-07-02 17:15:55', 1, 987.20, 1),
(1, 28, '2026-07-02 17:15:55', 1, 1000.00, 1),
(1, 29, '2026-07-02 17:15:55', 1, 1000.00, 1),
(1, 30, '2026-07-02 17:15:55', 1, 987.20, 1),
(1, 31, '2026-07-02 17:15:55', 1, 987.24, 1),
(1, 32, '2026-07-02 17:15:55', 1, 1019.20, 1),
(1, 33, '2026-07-02 17:15:55', 1, 1000.00, 1),
(1, 34, '2026-07-02 17:15:55', 1, 974.36, 1),
(1, 35, '2026-07-02 17:15:55', 1, 1000.00, 1),
(1, 36, '2026-07-02 17:15:55', 1, 1000.00, 1),
(4, 1, '2026-07-02 20:29:04', 5, 1000.00, 1),
(4, 29, '2026-07-03 09:46:31', 1, 1000.00, 1),
(4, 30, '2026-07-02 20:29:30', 1, 1000.00, 1),
(4, 37, '2026-07-02 21:04:23', 1, 1000.00, 0),
(5, 4, '2026-07-02 20:31:13', 5, 1000.00, 1),
(5, 29, '2026-07-02 23:48:51', 1, 1000.00, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `partidos`
--

CREATE TABLE `partidos` (
  `ID_PARTIDOS` int(10) UNSIGNED NOT NULL,
  `ID_LIGA` int(5) UNSIGNED NOT NULL,
  `FECHA_PARTIDO` date NOT NULL,
  `FORMATO` varchar(3) NOT NULL,
  `CANCHA_PARTIDO` int(5) UNSIGNED NOT NULL,
  `ESTADO` tinyint(1) UNSIGNED ZEROFILL NOT NULL,
  `FECHA_CREACION` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `partidos`
--

INSERT INTO `partidos` (`ID_PARTIDOS`, `ID_LIGA`, `FECHA_PARTIDO`, `FORMATO`, `CANCHA_PARTIDO`, `ESTADO`, `FECHA_CREACION`) VALUES
(0, 1, '2026-06-20', 'F5', 6, 0, '2026-07-02 16:52:04'),
(1, 1, '2026-02-17', 'F5', 4, 0, '2026-07-02 16:52:04'),
(2, 1, '2026-02-27', 'F5', 4, 0, '2026-07-02 16:52:04'),
(3, 1, '2026-03-06', 'F5', 4, 0, '2026-07-02 16:52:04'),
(4, 1, '2026-03-13', 'F5', 4, 0, '2026-07-02 16:52:04'),
(5, 1, '2026-04-17', 'F5', 4, 0, '2026-07-02 16:52:04'),
(6, 1, '2026-05-17', 'F5', 5, 0, '2026-07-02 16:52:04'),
(7, 1, '2026-06-05', 'F5', 4, 0, '2026-07-02 16:52:04'),
(8, 1, '2026-06-20', 'F5', 6, 0, '2026-07-02 16:52:04'),
(9, 1, '2026-06-29', '5', 4, 0, '2026-07-02 16:52:04'),
(10, 1, '2026-06-29', '5', 6, 0, '2026-07-02 16:52:04'),
(11, 1, '2026-06-29', '5', 4, 0, '2026-07-02 16:52:04'),
(14, 1, '2026-06-29', '5', 4, 0, '2026-07-02 16:52:04'),
(15, 1, '2026-06-29', '5', 4, 0, '2026-07-02 16:52:04'),
(16, 1, '2026-07-01', '5', 4, 0, '2026-07-02 16:52:04'),
(17, 1, '2026-07-01', '5', 6, 0, '2026-07-02 16:52:04'),
(18, 1, '2026-07-02', '5', 4, 0, '2026-07-02 16:52:04'),
(19, 1, '2026-07-02', '5', 4, 0, '2026-07-02 16:52:04'),
(20, 1, '2026-07-02', '5', 4, 0, '2026-07-02 16:52:04'),
(21, 1, '2026-07-02', '5', 5, 0, '2026-07-02 16:52:04'),
(22, 1, '2026-07-02', '5', 4, 0, '2026-07-02 16:52:04'),
(23, 1, '2026-07-02', 'F5', 4, 0, '2026-07-02 16:52:04'),
(24, 1, '2026-07-02', '5', 6, 0, '2026-07-02 16:52:04'),
(25, 1, '2026-07-02', '5', 6, 0, '2026-07-02 16:52:04'),
(26, 1, '2026-07-02', '5', 4, 0, '2026-07-02 16:52:04'),
(27, 1, '2026-07-02', '5', 6, 0, '2026-07-02 16:52:04'),
(28, 1, '2026-07-02', '5', 4, 0, '2026-07-02 16:52:04'),
(29, 1, '2026-07-02', '5', 4, 0, '2026-07-02 16:52:04'),
(30, 1, '2026-07-02', '5', 6, 0, '2026-07-02 16:52:04'),
(31, 1, '2026-07-02', '5', 6, 0, '2026-07-02 16:52:04'),
(32, 1, '2026-07-02', '5', 4, 0, '2026-07-02 16:52:04'),
(33, 1, '2026-07-02', '5', 6, 0, '2026-07-02 16:52:04'),
(34, 1, '2026-07-03', '5', 6, 1, '2026-07-03 11:11:34');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `partido_alineaciones`
--

CREATE TABLE `partido_alineaciones` (
  `ID_PARTIDO` int(10) UNSIGNED NOT NULL,
  `ID_USUARIO` int(10) UNSIGNED NOT NULL,
  `NUMERO_EQUIPO` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `partido_equipos`
--

CREATE TABLE `partido_equipos` (
  `ID_PARTIDO` int(10) UNSIGNED NOT NULL,
  `NUMERO_EQUIPO` int(1) NOT NULL,
  `COLOR` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recolector_eventos`
--

CREATE TABLE `recolector_eventos` (
  `ID_RECOLECTOR` int(10) UNSIGNED NOT NULL,
  `ID_PARTIDO` int(10) UNSIGNED NOT NULL,
  `ID_USUARIO` int(10) UNSIGNED NOT NULL,
  `ID_EVENTO_PARTIDO` int(2) UNSIGNED NOT NULL,
  `EQUIPO_EVENTO` int(1) NOT NULL,
  `MINUTO` int(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `recolector_eventos`
--

INSERT INTO `recolector_eventos` (`ID_RECOLECTOR`, `ID_PARTIDO`, `ID_USUARIO`, `ID_EVENTO_PARTIDO`, `EQUIPO_EVENTO`, `MINUTO`) VALUES
(1, 1, 1, 1, 1, NULL),
(2, 1, 1, 1, 1, NULL),
(3, 1, 1, 1, 1, NULL),
(4, 1, 1, 1, 1, NULL),
(5, 1, 1, 1, 1, NULL),
(6, 1, 1, 2, 1, NULL),
(7, 1, 4, 1, 1, NULL),
(8, 1, 4, 1, 1, NULL),
(9, 1, 4, 1, 1, NULL),
(10, 1, 4, 1, 1, NULL),
(11, 1, 4, 2, 1, NULL),
(12, 1, 3, 1, 1, NULL),
(13, 1, 11, 2, 1, NULL),
(14, 1, 11, 2, 1, NULL),
(15, 1, 11, 2, 1, NULL),
(16, 1, 9, 2, 1, NULL),
(17, 1, 6, 2, 2, NULL),
(18, 1, 14, 1, 2, NULL),
(19, 1, 14, 1, 2, NULL),
(20, 1, 15, 1, 2, NULL),
(21, 1, 15, 1, 2, NULL),
(22, 1, 15, 1, 2, NULL),
(23, 1, 16, 1, 2, NULL),
(24, 1, 17, 6, 2, NULL),
(25, 2, 6, 1, 1, NULL),
(26, 2, 14, 1, 1, NULL),
(27, 2, 9, 1, 1, NULL),
(28, 2, 9, 1, 1, NULL),
(29, 2, 10, 1, 1, NULL),
(30, 2, 10, 1, 1, NULL),
(31, 2, 18, 1, 1, NULL),
(32, 2, 18, 1, 1, NULL),
(33, 2, 11, 1, 2, NULL),
(34, 2, 11, 1, 2, NULL),
(35, 2, 11, 1, 2, NULL),
(36, 2, 11, 2, 2, NULL),
(37, 2, 3, 1, 2, NULL),
(38, 2, 3, 1, 2, NULL),
(39, 2, 3, 2, 2, NULL),
(40, 2, 8, 2, 2, NULL),
(41, 2, 4, 1, 2, NULL),
(42, 2, 4, 2, 2, NULL),
(43, 2, 2, 6, 2, NULL),
(44, 3, 1, 1, 1, NULL),
(45, 3, 1, 1, 1, NULL),
(46, 3, 1, 2, 1, NULL),
(47, 3, 1, 2, 1, NULL),
(48, 3, 11, 1, 1, NULL),
(49, 3, 11, 1, 1, NULL),
(50, 3, 11, 2, 1, NULL),
(51, 3, 11, 2, 1, NULL),
(52, 3, 3, 1, 1, NULL),
(53, 3, 3, 2, 1, NULL),
(54, 3, 4, 1, 1, NULL),
(55, 3, 4, 1, 1, NULL),
(56, 3, 4, 2, 1, NULL),
(57, 3, 4, 2, 1, NULL),
(58, 3, 4, 2, 1, NULL),
(59, 3, 5, 1, 1, NULL),
(60, 3, 5, 1, 1, NULL),
(61, 3, 6, 6, 2, NULL),
(62, 3, 7, 1, 2, NULL),
(63, 3, 7, 1, 2, NULL),
(64, 3, 8, 1, 2, NULL),
(65, 3, 8, 1, 2, NULL),
(66, 3, 8, 1, 2, NULL),
(67, 3, 8, 1, 2, NULL),
(68, 3, 9, 2, 2, NULL),
(69, 3, 10, 1, 2, NULL),
(70, 3, 10, 2, 2, NULL),
(71, 3, 10, 2, 2, NULL),
(72, 4, 6, 6, 1, NULL),
(73, 4, 3, 1, 1, NULL),
(74, 4, 3, 2, 1, NULL),
(75, 4, 4, 2, 1, NULL),
(76, 4, 7, 1, 1, NULL),
(77, 4, 7, 1, 1, NULL),
(78, 4, 7, 1, 1, NULL),
(79, 4, 25, 1, 1, NULL),
(80, 4, 25, 1, 1, NULL),
(81, 4, 25, 1, 1, NULL),
(82, 4, 25, 1, 1, NULL),
(83, 4, 25, 1, 1, NULL),
(84, 4, 1, 1, 2, NULL),
(85, 4, 1, 1, 2, NULL),
(86, 4, 1, 1, 2, NULL),
(87, 4, 1, 2, 2, NULL),
(88, 4, 11, 1, 2, NULL),
(89, 4, 11, 2, 2, NULL),
(90, 4, 8, 1, 2, NULL),
(91, 4, 8, 1, 2, NULL),
(92, 4, 8, 1, 2, NULL),
(93, 4, 8, 1, 2, NULL),
(94, 4, 9, 2, 2, NULL),
(95, 4, 9, 2, 2, NULL),
(96, 4, 2, 2, 2, NULL),
(97, 5, 9, 1, 1, NULL),
(98, 5, 9, 1, 1, NULL),
(99, 5, 9, 1, 1, NULL),
(100, 5, 9, 2, 1, NULL),
(101, 5, 7, 1, 1, NULL),
(102, 5, 7, 1, 1, NULL),
(103, 5, 7, 2, 1, NULL),
(104, 5, 20, 1, 1, NULL),
(105, 5, 19, 1, 1, NULL),
(106, 5, 19, 2, 1, NULL),
(107, 5, 21, 1, 1, NULL),
(108, 5, 11, 1, 2, NULL),
(109, 5, 11, 1, 2, NULL),
(110, 5, 11, 1, 2, NULL),
(111, 5, 3, 1, 2, NULL),
(112, 5, 3, 2, 2, NULL),
(113, 5, 6, 2, 2, NULL),
(114, 5, 6, 2, 2, NULL),
(115, 5, 8, 1, 2, NULL),
(116, 5, 8, 1, 2, NULL),
(117, 5, 8, 1, 2, NULL),
(118, 5, 8, 1, 2, NULL),
(119, 5, 4, 6, 2, NULL),
(120, 6, 11, 1, 1, NULL),
(121, 6, 11, 1, 1, NULL),
(122, 6, 11, 2, 1, NULL),
(123, 6, 3, 1, 1, NULL),
(124, 6, 3, 1, 1, NULL),
(125, 6, 3, 1, 1, NULL),
(126, 6, 6, 1, 1, NULL),
(127, 6, 9, 1, 1, NULL),
(128, 6, 9, 1, 1, NULL),
(129, 6, 9, 1, 1, NULL),
(130, 6, 9, 2, 1, NULL),
(131, 6, 4, 1, 1, NULL),
(132, 6, 4, 1, 1, NULL),
(133, 6, 4, 2, 1, NULL),
(134, 6, 4, 2, 1, NULL),
(135, 6, 1, 2, 2, NULL),
(136, 6, 8, 6, 2, NULL),
(137, 6, 14, 1, 2, NULL),
(138, 6, 15, 1, 2, NULL),
(139, 6, 15, 1, 2, NULL),
(140, 6, 15, 1, 2, NULL),
(141, 6, 15, 1, 2, NULL),
(142, 6, 15, 2, 2, NULL),
(143, 6, 22, 1, 2, NULL),
(144, 7, 1, 1, 1, NULL),
(145, 7, 1, 1, 1, NULL),
(146, 7, 1, 2, 1, NULL),
(147, 7, 1, 2, 1, NULL),
(148, 7, 1, 2, 1, NULL),
(149, 7, 1, 2, 1, NULL),
(150, 7, 11, 1, 1, NULL),
(151, 7, 11, 1, 1, NULL),
(152, 7, 11, 1, 1, NULL),
(153, 7, 11, 2, 1, NULL),
(154, 7, 3, 1, 1, NULL),
(155, 7, 3, 1, 1, NULL),
(156, 7, 3, 2, 1, NULL),
(157, 7, 8, 1, 1, NULL),
(158, 7, 8, 1, 1, NULL),
(159, 7, 8, 2, 1, NULL),
(160, 7, 9, 1, 1, NULL),
(161, 7, 9, 1, 1, NULL),
(162, 7, 6, 6, 2, NULL),
(163, 7, 4, 1, 2, NULL),
(164, 7, 20, 1, 2, NULL),
(165, 7, 20, 1, 2, NULL),
(166, 7, 20, 1, 2, NULL),
(167, 7, 23, 1, 2, NULL),
(168, 7, 23, 1, 2, NULL),
(169, 7, 23, 1, 2, NULL),
(170, 7, 24, 6, 2, NULL),
(171, 8, 1, 1, 1, NULL),
(172, 8, 1, 1, 1, NULL),
(173, 8, 1, 1, 1, NULL),
(174, 8, 1, 1, 1, NULL),
(175, 8, 1, 1, 1, NULL),
(176, 8, 1, 2, 1, NULL),
(177, 8, 1, 2, 1, NULL),
(178, 8, 2, 1, 1, NULL),
(179, 8, 19, 1, 1, NULL),
(180, 8, 19, 2, 1, NULL),
(181, 8, 9, 1, 1, NULL),
(182, 8, 9, 2, 1, NULL),
(183, 8, 9, 2, 1, NULL),
(184, 8, 8, 1, 1, NULL),
(185, 8, 8, 2, 1, NULL),
(186, 8, 8, 2, 1, NULL),
(187, 8, 4, 1, 2, NULL),
(188, 8, 4, 1, 2, NULL),
(189, 8, 6, 6, 2, NULL),
(190, 8, 14, 1, 2, NULL),
(191, 8, 3, 1, 2, NULL),
(192, 8, 3, 2, 2, NULL),
(193, 8, 26, 1, 2, NULL),
(194, 8, 26, 2, 2, NULL),
(195, 8, 26, 2, 2, NULL),
(196, 8, 20, 1, 2, NULL),
(197, 8, 20, 1, 2, NULL),
(198, 9, 22, 1, 1, NULL),
(199, 9, 26, 2, 1, NULL),
(200, 9, 26, 1, 1, NULL),
(201, 9, 14, 1, 2, NULL),
(202, 9, 11, 2, 2, NULL),
(203, 9, 14, 1, 2, NULL),
(204, 9, 28, 1, 2, NULL),
(205, 9, 11, 2, 2, NULL),
(206, 10, 26, 1, 1, NULL),
(207, 10, 22, 2, 1, NULL),
(208, 10, 15, 1, 1, NULL),
(209, 10, 22, 2, 1, NULL),
(210, 10, 1, 1, 2, NULL),
(211, 10, 7, 2, 2, NULL),
(212, 10, 19, 1, 2, NULL),
(213, 10, 25, 3, 2, NULL),
(214, 10, 16, 3, 2, NULL),
(215, 10, 22, 1, 1, NULL),
(216, 10, 3, 3, 1, NULL),
(217, 10, 25, 3, 1, NULL),
(218, 11, 22, 1, 1, NULL),
(219, 11, 20, 2, 1, NULL),
(220, 11, 20, 1, 1, NULL),
(221, 11, 29, 2, 1, NULL),
(222, 11, 22, 1, 1, NULL),
(223, 11, 23, 1, 2, NULL),
(224, 11, 17, 2, 2, NULL),
(225, 11, 24, 3, 2, NULL),
(226, 11, 15, 3, 2, NULL),
(243, 14, 1, 1, 1, NULL),
(244, 14, 7, 2, 1, NULL),
(245, 14, 6, 1, 1, NULL),
(246, 14, 1, 2, 1, NULL),
(247, 14, 2, 1, 2, NULL),
(248, 14, 14, 2, 2, NULL),
(249, 14, 26, 1, 2, NULL),
(250, 14, 1, 1, 1, NULL),
(251, 15, 1, 1, 1, NULL),
(252, 15, 2, 1, 1, NULL),
(253, 15, 3, 2, 1, NULL),
(254, 15, 4, 1, 1, NULL),
(255, 15, 6, 1, 2, NULL),
(256, 15, 7, 2, 2, NULL),
(257, 15, 8, 1, 2, NULL),
(258, 16, 29, 1, 1, NULL),
(259, 16, 26, 2, 1, NULL),
(260, 16, 8, 1, 1, NULL),
(261, 16, 29, 2, 1, NULL),
(262, 16, 28, 1, 2, NULL),
(263, 16, 25, 1, 2, NULL),
(264, 16, 22, 2, 2, NULL),
(265, 16, 24, 3, 1, NULL),
(266, 16, 9, 3, 1, NULL),
(267, 16, 28, 3, 2, NULL),
(268, 16, 24, 3, 2, NULL),
(269, 16, 24, 1, 2, NULL),
(270, 17, 25, 1, 1, NULL),
(271, 17, 22, 2, 1, NULL),
(272, 17, 8, 1, 2, NULL),
(273, 17, 22, 1, 1, NULL),
(274, 17, 26, 2, 1, NULL),
(275, 17, 25, 1, 1, NULL),
(276, 17, 15, 2, 1, NULL),
(277, 17, 8, 1, 2, NULL),
(278, 18, 1, 1, 1, NULL),
(279, 18, 7, 1, 1, NULL),
(280, 18, 1, 2, 1, NULL),
(281, 18, 3, 1, 2, NULL),
(282, 18, 5, 1, 2, NULL),
(283, 18, 3, 2, 2, NULL),
(284, 18, 26, 3, 2, NULL),
(285, 18, 11, 3, 2, NULL),
(286, 19, 1, 1, 1, NULL),
(287, 19, 15, 2, 1, NULL),
(288, 19, 7, 1, 1, NULL),
(289, 19, 25, 2, 1, NULL),
(290, 19, 1, 1, 1, NULL),
(291, 19, 26, 2, 1, NULL),
(292, 19, 1, 1, 1, NULL),
(293, 19, 7, 2, 1, NULL),
(294, 20, 1, 1, 1, NULL),
(295, 20, 7, 1, 1, NULL),
(296, 20, 1, 2, 1, NULL),
(297, 20, 3, 1, 2, NULL),
(298, 20, 5, 1, 2, NULL),
(299, 20, 3, 2, 2, NULL),
(300, 20, 26, 3, 2, NULL),
(301, 20, 11, 3, 2, NULL),
(302, 21, 1, 1, 1, NULL),
(303, 21, 3, 2, 1, NULL),
(304, 21, 9, 1, 1, NULL),
(305, 21, 5, 1, 2, NULL),
(306, 21, 14, 2, 2, NULL),
(307, 21, 7, 1, 2, NULL),
(308, 21, 28, 1, 2, NULL),
(309, 21, 14, 2, 2, NULL),
(310, 21, 2, 1, 1, NULL),
(311, 21, 1, 1, 1, NULL),
(312, 22, 26, 1, 1, NULL),
(313, 22, 1, 2, 1, NULL),
(314, 22, 22, 1, 1, NULL),
(315, 22, 1, 1, 1, NULL),
(316, 22, 15, 2, 1, NULL),
(317, 22, 30, 1, 2, NULL),
(318, 22, 3, 2, 2, NULL),
(319, 22, 7, 1, 2, NULL),
(320, 22, 25, 2, 2, NULL),
(321, 22, 3, 1, 2, NULL),
(322, 22, 22, 1, 1, NULL),
(323, 22, 1, 2, 1, NULL),
(324, 22, 5, 1, 1, NULL),
(325, 22, 26, 2, 1, NULL),
(326, 22, 25, 1, 2, NULL),
(327, 22, 26, 1, 1, NULL),
(328, 22, 15, 2, 1, NULL),
(329, 22, 7, 1, 2, NULL),
(330, 23, 1, 1, 1, NULL),
(331, 23, 2, 2, 1, NULL),
(332, 23, 3, 3, 2, NULL),
(333, 23, 4, 3, 2, NULL),
(334, 24, 32, 1, 1, NULL),
(335, 24, 4, 2, 1, NULL),
(336, 24, 31, 1, 1, NULL),
(337, 24, 15, 1, 1, NULL),
(338, 24, 31, 2, 1, NULL),
(339, 24, 19, 1, 2, NULL),
(340, 24, 14, 2, 2, NULL),
(341, 24, 11, 1, 2, NULL),
(342, 24, 14, 2, 2, NULL),
(343, 24, 25, 1, 2, NULL),
(344, 25, 26, 1, 1, NULL),
(345, 25, 25, 2, 1, NULL),
(346, 25, 7, 1, 2, NULL),
(347, 25, 16, 2, 2, NULL),
(348, 25, 21, 1, 2, NULL),
(349, 26, 22, 1, 1, NULL),
(350, 26, 1, 2, 1, NULL),
(351, 26, 26, 1, 1, NULL),
(352, 26, 2, 1, 2, NULL),
(353, 26, 17, 1, 2, NULL),
(354, 27, 16, 1, 1, NULL),
(355, 27, 5, 2, 1, NULL),
(356, 27, 6, 1, 2, NULL),
(357, 27, 16, 1, 1, NULL),
(358, 27, 36, 1, 2, NULL),
(359, 27, 8, 2, 2, NULL),
(360, 28, 26, 1, 1, NULL),
(361, 28, 30, 2, 1, NULL),
(362, 28, 31, 1, 2, NULL),
(363, 28, 7, 2, 2, NULL),
(364, 28, 22, 1, 1, NULL),
(365, 29, 22, 1, 1, NULL),
(366, 29, 32, 2, 1, NULL),
(367, 29, 36, 1, 2, NULL),
(368, 29, 19, 1, 2, NULL),
(369, 30, 22, 1, 1, NULL),
(370, 30, 21, 1, 2, NULL),
(371, 30, 19, 2, 2, NULL),
(372, 31, 30, 1, 1, NULL),
(373, 31, 22, 2, 1, NULL),
(374, 31, 4, 1, 2, NULL),
(375, 32, 3, 1, 1, NULL),
(376, 32, 15, 2, 1, NULL),
(377, 32, 19, 1, 2, NULL),
(378, 32, 21, 2, 2, NULL),
(379, 32, 21, 1, 2, NULL),
(380, 33, 22, 1, 1, NULL),
(381, 33, 32, 1, 2, NULL),
(382, 33, 16, 2, 2, NULL),
(383, 33, 30, 6, 1, NULL),
(384, 33, 26, 6, 1, NULL),
(385, 33, 25, 6, 1, NULL),
(386, 33, 1, 6, 1, NULL),
(387, 33, 5, 6, 2, NULL),
(388, 33, 7, 6, 2, NULL),
(389, 33, 34, 6, 2, NULL),
(390, 34, 8, 1, 2, NULL),
(391, 34, 4, 1, 1, NULL),
(392, 34, 9, 6, 1, NULL),
(393, 34, 16, 6, 1, NULL),
(394, 34, 34, 6, 1, NULL),
(395, 34, 6, 6, 2, NULL),
(396, 34, 14, 6, 2, NULL),
(397, 34, 23, 6, 2, NULL),
(398, 34, 31, 6, 2, NULL);

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
(2, 'DIRIGENTE'),
(9, 'DEV');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `canchas`
--
ALTER TABLE `canchas`
  ADD PRIMARY KEY (`ID_CANCHA`),
  ADD KEY `ID_LIGA` (`ID_LIGA`);

--
-- Indices de la tabla `contactos`
--
ALTER TABLE `contactos`
  ADD PRIMARY KEY (`id_contactos`);

--
-- Indices de la tabla `estadisticas`
--
ALTER TABLE `estadisticas`
  ADD PRIMARY KEY (`ID_ESTADISTICAS`),
  ADD UNIQUE KEY `liga_usuario` (`ID_LIGA`,`ID_USUARIO`),
  ADD KEY `ID_JUGADOR` (`ID_USUARIO`);

--
-- Indices de la tabla `eventos`
--
ALTER TABLE `eventos`
  ADD PRIMARY KEY (`ID_EVENTOS`);

--
-- Indices de la tabla `invitaciones`
--
ALTER TABLE `invitaciones`
  ADD PRIMARY KEY (`ID_INVITACION`),
  ADD KEY `ID_LIGA` (`ID_LIGA`);

--
-- Indices de la tabla `jugadores`
--
ALTER TABLE `jugadores`
  ADD PRIMARY KEY (`ID_JUGADORES`),
  ADD UNIQUE KEY `NOMBRE` (`NOMBRE`),
  ADD KEY `ROL` (`ROL`);

--
-- Indices de la tabla `ligas`
--
ALTER TABLE `ligas`
  ADD PRIMARY KEY (`ID_LIGA`),
  ADD UNIQUE KEY `CODIGO_INVITACION` (`CODIGO_INVITACION`),
  ADD KEY `ID_CREADOR` (`ID_CREADOR`);

--
-- Indices de la tabla `liga_miembros`
--
ALTER TABLE `liga_miembros`
  ADD PRIMARY KEY (`ID_LIGA`,`ID_USUARIO`),
  ADD KEY `ID_USUARIO` (`ID_USUARIO`),
  ADD KEY `ROL_LIGA` (`ROL_LIGA`);

--
-- Indices de la tabla `partidos`
--
ALTER TABLE `partidos`
  ADD PRIMARY KEY (`ID_PARTIDOS`),
  ADD KEY `CANCHA_PARTIDO` (`CANCHA_PARTIDO`),
  ADD KEY `ID_LIGA` (`ID_LIGA`);

--
-- Indices de la tabla `partido_alineaciones`
--
ALTER TABLE `partido_alineaciones`
  ADD PRIMARY KEY (`ID_PARTIDO`,`ID_USUARIO`),
  ADD KEY `ID_USUARIO` (`ID_USUARIO`);

--
-- Indices de la tabla `partido_equipos`
--
ALTER TABLE `partido_equipos`
  ADD PRIMARY KEY (`ID_PARTIDO`,`NUMERO_EQUIPO`);

--
-- Indices de la tabla `recolector_eventos`
--
ALTER TABLE `recolector_eventos`
  ADD PRIMARY KEY (`ID_RECOLECTOR`),
  ADD KEY `ID_JUGADOR_EVENTO` (`ID_USUARIO`),
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
  MODIFY `ID_CANCHA` int(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `contactos`
--
ALTER TABLE `contactos`
  MODIFY `id_contactos` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `estadisticas`
--
ALTER TABLE `estadisticas`
  MODIFY `ID_ESTADISTICAS` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT de la tabla `eventos`
--
ALTER TABLE `eventos`
  MODIFY `ID_EVENTOS` int(1) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `invitaciones`
--
ALTER TABLE `invitaciones`
  MODIFY `ID_INVITACION` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `jugadores`
--
ALTER TABLE `jugadores`
  MODIFY `ID_JUGADORES` int(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT de la tabla `ligas`
--
ALTER TABLE `ligas`
  MODIFY `ID_LIGA` int(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `partidos`
--
ALTER TABLE `partidos`
  MODIFY `ID_PARTIDOS` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT de la tabla `recolector_eventos`
--
ALTER TABLE `recolector_eventos`
  MODIFY `ID_RECOLECTOR` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=399;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `ID_ROLES` int(1) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `canchas`
--
ALTER TABLE `canchas`
  ADD CONSTRAINT `canchas_ibfk_1` FOREIGN KEY (`ID_LIGA`) REFERENCES `ligas` (`ID_LIGA`);

--
-- Filtros para la tabla `estadisticas`
--
ALTER TABLE `estadisticas`
  ADD CONSTRAINT `estadisticas_ibfk_1` FOREIGN KEY (`ID_USUARIO`) REFERENCES `jugadores` (`ID_JUGADORES`),
  ADD CONSTRAINT `estadisticas_ibfk_2` FOREIGN KEY (`ID_LIGA`) REFERENCES `ligas` (`ID_LIGA`);

--
-- Filtros para la tabla `invitaciones`
--
ALTER TABLE `invitaciones`
  ADD CONSTRAINT `invitaciones_ibfk_1` FOREIGN KEY (`ID_LIGA`) REFERENCES `ligas` (`ID_LIGA`) ON DELETE CASCADE;

--
-- Filtros para la tabla `jugadores`
--
ALTER TABLE `jugadores`
  ADD CONSTRAINT `jugadores_ibfk_1` FOREIGN KEY (`ROL`) REFERENCES `roles` (`ID_ROLES`);

--
-- Filtros para la tabla `ligas`
--
ALTER TABLE `ligas`
  ADD CONSTRAINT `ligas_ibfk_1` FOREIGN KEY (`ID_CREADOR`) REFERENCES `jugadores` (`ID_JUGADORES`);

--
-- Filtros para la tabla `liga_miembros`
--
ALTER TABLE `liga_miembros`
  ADD CONSTRAINT `liga_miembros_ibfk_1` FOREIGN KEY (`ID_LIGA`) REFERENCES `ligas` (`ID_LIGA`) ON DELETE CASCADE,
  ADD CONSTRAINT `liga_miembros_ibfk_2` FOREIGN KEY (`ID_USUARIO`) REFERENCES `jugadores` (`ID_JUGADORES`) ON DELETE CASCADE;

--
-- Filtros para la tabla `partidos`
--
ALTER TABLE `partidos`
  ADD CONSTRAINT `partidos_ibfk_1` FOREIGN KEY (`CANCHA_PARTIDO`) REFERENCES `canchas` (`ID_CANCHA`),
  ADD CONSTRAINT `partidos_ibfk_2` FOREIGN KEY (`ID_LIGA`) REFERENCES `ligas` (`ID_LIGA`);

--
-- Filtros para la tabla `partido_alineaciones`
--
ALTER TABLE `partido_alineaciones`
  ADD CONSTRAINT `partido_alineaciones_ibfk_1` FOREIGN KEY (`ID_PARTIDO`) REFERENCES `partidos` (`ID_PARTIDOS`) ON DELETE CASCADE,
  ADD CONSTRAINT `partido_alineaciones_ibfk_2` FOREIGN KEY (`ID_USUARIO`) REFERENCES `jugadores` (`ID_JUGADORES`);

--
-- Filtros para la tabla `partido_equipos`
--
ALTER TABLE `partido_equipos`
  ADD CONSTRAINT `partido_equipos_ibfk_1` FOREIGN KEY (`ID_PARTIDO`) REFERENCES `partidos` (`ID_PARTIDOS`) ON DELETE CASCADE;

--
-- Filtros para la tabla `recolector_eventos`
--
ALTER TABLE `recolector_eventos`
  ADD CONSTRAINT `recolector_eventos_ibfk_1` FOREIGN KEY (`ID_USUARIO`) REFERENCES `jugadores` (`ID_JUGADORES`),
  ADD CONSTRAINT `recolector_eventos_ibfk_2` FOREIGN KEY (`ID_EVENTO_PARTIDO`) REFERENCES `eventos` (`ID_EVENTOS`),
  ADD CONSTRAINT `recolector_eventos_ibfk_3` FOREIGN KEY (`ID_PARTIDO`) REFERENCES `partidos` (`ID_PARTIDOS`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
