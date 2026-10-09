-- =====================================================================
-- SHREE SAI ENTERPRISES - SEED DATA
-- Authorised Vendor: PM Surya Ghar Muft Bijli Yojana (MNRE)
-- Dindori, Nashik, Maharashtra
-- =====================================================================

USE `shree_sai_enterprises`;

-- 1. Admin User (Password: admin123)
INSERT INTO `admin_users` (`username`, `email`, `password_hash`, `full_name`, `role`)
VALUES 
('admin', 'samadhanj182@gmail.com', '$2a$10$w6blY.Ibki7rRf8.kPOme.bSn1bq4R8Tb67TRx8ON8TXwxwMLV7um', 'Samadhan R. Jadhav', 'superadmin')
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

-- 2. Categories
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `hsn_code`, `icon`)
VALUES
(1, 'Solar Panels', 'solar-panels', 'High efficiency Mono PERC, Polycrystalline and Bifacial solar PV modules with DCR certification for PM Surya Ghar subsidy.', '85414011', 'sun'),
(2, 'Solar Water Heaters', 'solar-water-heaters', 'Reliable ETC and FPC solar water heating systems for domestic, agricultural, and commercial hot water needs.', '84191920', 'droplet'),
(3, 'Inverters', 'inverters', 'Next-generation on-grid, off-grid, and hybrid solar inverters and PCUs with smart MPPT and mobile WiFi tracking.', '85044090', 'zap'),
(4, 'Batteries', 'batteries', 'Heavy-duty C10 tall tubular and long-life Lithium-ion (LiFePO4) solar storage batteries designed for Indian power conditions.', '85072000', 'battery-charging')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 3. Products (5-6 realistic items per category)
INSERT INTO `products` 
(`id`, `category_id`, `name`, `slug`, `short_info`, `full_description`, `approx_price`, `gst_rate`, `hsn_code`, `stock_qty`, `stock_status`, `primary_image`, `warranty`, `specifications`, `key_features`, `is_featured`)
VALUES
-- SOLAR PANELS
(1, 1, '550W Mono PERC Half-Cut Solar Panel', '550w-mono-perc-half-cut-solar-panel', 
 '550W Tier-1 high efficiency Mono PERC panel with 144 half-cut cells, anti-PID technology and weather resistant tempered glass.',
 'Engineered for maximum power harvesting even in low-light and high-temperature conditions. Ideal for PM Surya Ghar residential and agricultural installations across Dindori and Nashik district.',
 14500.00, 12.00, '85414011', 45, 'in_stock', '/images/products/mono-perc-550w.svg', '25-Year Linear Performance Warranty',
 '{"Rated Power": "550 Watts", "Cell Type": "Mono PERC Half-Cut 144 Cells", "Module Efficiency": "21.3%", "Max Power Voltage (Vmp)": "41.95 V", "Max Power Current (Imp)": "13.12 A", "Dimensions": "2279 x 1134 x 35 mm", "Weight": "28.5 kg", "Glass": "3.2mm Toughened ARC Glass"}',
 '["144 Half-cut cell design reduces resistive power loss", "Anti-PID (Potential Induced Degradation) certified", "Excellent performance under low light & high Nashik temperatures", "Heavy snow (5400 Pa) and wind load (2400 Pa) endurance", "PM Surya Ghar Yojana compliant with DCR cell option"]', 1),

(2, 1, '330W 24V Polycrystalline Solar Panel', '330w-24v-polycrystalline-solar-panel', 
 'Cost-effective 72-cell poly solar module, ideal for off-grid homes, farmhouses, and tube-well backup systems.',
 'Sturdy anodized aluminium alloy frame with high mechanical strength. High transmission low-iron tempered glass delivers dependable output for decades.',
 8200.00, 12.00, '85414011', 30, 'in_stock', '/images/products/poly-330w.svg', '25-Year Performance Warranty',
 '{"Rated Power": "330 Watts", "Cell Type": "Polycrystalline 72 Cells", "Module Efficiency": "17.4%", "Max Power Voltage (Vmp)": "37.5 V", "Max Power Current (Imp)": "8.80 A", "Dimensions": "1960 x 990 x 35 mm", "Weight": "21.0 kg"}',
 '["Economical choice for budget-conscious rural & farm installations", "IP67 rated junction box with bypass diodes", "Positive power tolerance 0 to +3%", "Proven reliability across rural Maharashtra installations"]', 0),

(3, 1, '540W Bifacial Dual Glass Mono PERC Panel', '540w-bifacial-dual-glass-mono-perc-panel', 
 'Generates up to 25% extra electricity from reflected ground light using dual-glass bifacial architecture.',
 'Double-sided power generation module perfect for rooftop sheds, elevated solar carports, and industrial warehouses in Nashik.',
 15800.00, 12.00, '85414011', 25, 'in_stock', '/images/products/bifacial-540w.svg', '30-Year Bifacial Performance Warranty',
 '{"Rated Power": "540 Watts (Front) + up to 25% rear gain", "Bifaciality Factor": "70% ± 5%", "Cell Type": "Dual Glass Mono PERC", "Module Efficiency": "21.6%", "Dimensions": "2278 x 1134 x 30 mm", "Weight": "32.0 kg"}',
 '["Up to 25% additional power gain from rear albedo reflection", "Frameless or reinforced frame dual-glass construction", "Zero risk of backsheet micro-cracks or water ingress", "Fire Class A certified safety for rooftop structures"]', 1),

(4, 1, '450W Monocrystalline Half-Cut Solar Panel', '450w-monocrystalline-half-cut-solar-panel', 
 'Compact high-density 120-cell mono module, optimised for residential urban rooftops with limited shade-free footprint.',
 'Ideal balance of physical dimensions and power output. Generates maximum units per square foot of rooftop space.',
 12900.00, 12.00, '85414011', 18, 'in_stock', '/images/products/halfcut-mono-450w.svg', '25-Year Performance Warranty',
 '{"Rated Power": "450 Watts", "Cell Type": "Mono PERC 120 Half-Cut Cells", "Module Efficiency": "20.9%", "Dimensions": "1903 x 1134 x 35 mm", "Weight": "24.0 kg"}',
 '["Compact size easily handled during terrace rooftop installations", "Superior shade tolerance with 3 bypass diodes", "Lower temperature coefficient for hotter summer months", "Sleek all-black aesthetic appearance"]', 0),

(5, 1, '535W DCR Approved Mono PERC Solar Panel', '535w-dcr-approved-mono-perc-solar-panel', 
 '100% Domestic Content Requirement (DCR) certified module mandatory for PM Surya Ghar Central Financial Assistance (CFA) subsidy.',
 'Manufactured in India with indigenous cells and wafers. Fully compliant with Ministry of New and Renewable Energy (MNRE) guidelines.',
 15200.00, 12.00, '85414011', 50, 'in_stock', '/images/products/dcr-mono-535w.svg', '25-Year Warranty (MNRE Approved)',
 '{"Rated Power": "535 Watts", "Cell Origin": "Made in India (DCR Compliant)", "Module Efficiency": "20.8%", "Dimensions": "2278 x 1134 x 35 mm", "Certifications": "BIS, MNRE ALMM Listed"}',
 '["Strictly ALMM Listed and DCR Certified for Gov. Subsidy", "Unlocks up to ₹78,000 direct subsidy to customer bank account", "Passed salt-mist and ammonia corrosion tests", "Fully compatible with MSEDCL net-metering standards"]', 1),

(6, 1, 'PM Surya Ghar 3kW Complete Rooftop Package', 'pm-surya-ghar-3kw-complete-rooftop-package', 
 'Turnkey 3kW rooftop solar kit: 6x 540W DCR panels, 3.3kW On-Grid Inverter, GI mounting structure, ACDB/DCDB, earthing and MSEDCL net metering liaison.',
 'Complete solution for a standard 2-3 BHK home in Dindori/Nashik. Saves ₹3,000 to ₹4,500 every month on electricity bills. Eligible for maximum ₹78,000 PM Surya Ghar subsidy.',
 165000.00, 12.00, '85414011', 12, 'in_stock', '/images/products/rooftop-solar-combo.svg', '25 Years on Panels, 8 Years on Inverter',
 '{"Plant Capacity": "3.3 kWp DC / 3.0 kW AC", "Monthly Generation": "360 - 420 Units (kWh)", "Rooftop Area Required": "Approx 220 - 250 sq.ft", "Inverter": "3.3kW Single Phase On-Grid with WiFi", "Structure": "Hot Dip Galvanized 80 Micron"}',
 '["Comprehensive turnkey installation by Shree Sai Enterprises", "Govt Subsidy up to ₹78,000 processed directly to your account", "MSEDCL bi-directional net-meter paperwork and liaison included", "Lightning arrester, chemical earthing pits, and surge protection included"]', 1),

-- SOLAR WATER HEATERS
(7, 2, '100 LPD ETC Solar Water Heater', '100-lpd-etc-solar-water-heater',
 'Compact 100 Litres Per Day Evacuated Tube Collector solar water heater designed for 2-3 member households.',
 'High-grade borosilicate 3-target glass tubes with copper-selective coating deliver scalding hot water even on overcast winter mornings in Nashik.',
 16500.00, 12.00, '84191920', 15, 'in_stock', '/images/products/solar-water-heater-etc-100lpd.svg', '5-Year Tank Replacement Warranty',
 '{"Capacity": "100 Litres Per Day", "Collector Type": "Evacuated Tube Collector (ETC)", "No. of Tubes": "10 Tubes (58mm x 1800mm)", "Inner Tank": "Food Grade SS304-2B Stainless Steel", "Insulation": "50mm High Density Injected PUF", "Outer Cladding": "Powder Coated Galvanized Steel"}',
 '["Heats water up to 60°C - 80°C using zero electricity", "Special ceramic coating prevents hard water scaling", "Keeps water hot for over 48 hours thanks to injected PUF insulation", "Easy installation on flat terrace or sloping roof"]', 1),

(8, 2, '200 LPD ETC Non-Pressurized Solar Water Heater', '200-lpd-etc-non-pressurized-solar-water-heater',
 'Popular 200 Litres Per Day system, the #1 choice for typical 4 to 6 member families in Dindori and Nashik.',
 'Reduces your electric geyser power consumption to zero. Features sacrificial magnesium anode rod to protect against hard groundwater mineral buildup.',
 26800.00, 12.00, '84191920', 20, 'in_stock', '/images/products/solar-water-heater-etc-200lpd.svg', '5-Year Manufacturer Warranty',
 '{"Capacity": "200 Litres Per Day", "Collector Type": "15x Three-Target Borosilicate Glass Tubes", "Inner Tank": "SS304 Non-Magnetic Stainless Steel", "Frame": "Rust-proof Powder Coated GI Stand", "Max Temperature": "85°C"}',
 '["Saves up to 1,800 units of domestic electricity per year", "Magnesium anode included for hard water longevity", "Heavy duty stand designed to withstand high winds", "Built-in auxiliary backup electrical heater port (optional)"]', 1),

(9, 2, '300 LPD FPC Flat Plate Collector Solar Water Heater', '300-lpd-fpc-flat-plate-collector-solar-water-heater',
 'Heavy-duty 300 Litres Flat Plate Collector system with copper absorber plate, toughened glass, and high pressure capability.',
 'Engineered for luxury homes, multi-story bungalows, and pressure-pump booster plumbing setups.',
 48000.00, 12.00, '84191920', 8, 'in_stock', '/images/products/solar-water-heater-fpc-300lpd.svg', '7-Year Warranty on Collector',
 '{"Capacity": "300 Litres Per Day", "Collector Type": "2x Copper-Copper Ultrasonic Welded Flat Plates", "Glass": "4mm High Transmission Toughened Solar Glass", "Pressure Rating": "Tested up to 5.0 bar (booster pump safe)", "Tank": "Inner Vitreous Enamel Coated Heavy Gauge Tank"}',
 '["Compatible with automatic bathroom booster water pumps", "Copper fin-and-tube core with 99.9% thermal conductivity", "Highly resistant to hail, stone hits, and thermal shock", "Designed for large 6-8 member joint families and bungalows"]', 0),

(10, 2, '500 LPD Commercial Solar Water Heating System', '500-lpd-commercial-solar-water-heating-system',
 'High-capacity 500 Litres Per Day solar water heater for hostels, hotels, dairies, hospitals, and agro-processing units in Nashik district.',
 'Modular manifold system with heavy-gauge insulated storage tank. Can be linked with circulation pumps and temperature controller automation.',
 72000.00, 12.00, '84191920', 5, 'in_stock', '/images/products/solar-water-heater-etc-500lpd.svg', '5-Year System Warranty',
 '{"Capacity": "500 Litres Per Day", "Collector Configuration": "34 Evacuated Vacuum Tubes / Dual Manifold", "Inner Tank": "SS316 Acid & Corrosion Resistant Steel", "Insulation": "60mm High Density Polyurethane Foam"}',
 '["Massive energy savings for commercial kitchens, lodges, and hospitals", "Can be scaled up modularly to 1000, 2000, or 5000 LPD", "Integrated temperature sensor port and drain valves", "Professional on-site piping installation provided by Shree Sai Enterprises"]', 0),

(11, 2, '250 LPD Pressurized Solar Water Heater', '250-lpd-pressurized-solar-water-heater',
 'Specialized 250 LPD system designed to withstand high water pressure from overhead hydropneumatic booster pumps and modern rain showers.',
 'Features internal heat exchanger copper coil or heavy-walled inner tank tested to withstand up to 6 bar operating pressure.',
 39500.00, 12.00, '84191920', 7, 'in_stock', '/images/products/pressurized-swh-250lpd.svg', '5-Year Warranty',
 '{"Capacity": "250 Litres Per Day", "Pressure Tolerance": "Up to 6 kg/cm²", "Inner Tank": "Heavy gauge steel with anti-corrosion enamel coating", "Tubes": "Heat Pipe / U-Pipe Technology"}',
 '["Works seamlessly with multi-flow rain showers and jacuzzis", "Eliminates hot/cold pressure fluctuations", "Superior thermal retention in freezing winter nights", "Corrosion-resistant powder coated support structure"]', 0),

-- INVERTERS
(12, 3, '1 kVA / 12V Pure Sine Wave Solar Hybrid Inverter', '1-kva-12v-pure-sine-wave-solar-hybrid-inverter',
 'Smart 1000VA entry-level hybrid solar inverter with built-in 40A MPPT charge controller and dual AC charging modes.',
 'Perfect for small homes, shops, and rural establishments running lights, fans, computer, and TV directly on free solar power.',
 8500.00, 18.00, '85044090', 25, 'in_stock', '/images/products/micro-inverter-1kva.svg', '2-Year On-Site Warranty',
 '{"Rated Capacity": "1000 VA / 800 Watts", "Battery Voltage": "12V DC (Single Battery)", "Solar Charge Controller": "MPPT 40A", "Max PV Input": "800 Wp (Voc: 15V - 50V)", "Waveform": "Pure Sine Wave (<3% THD)"}',
 '["Solar priority mode cuts grid electricity consumption first", "Intelligent battery charging algorithm extends battery life by 25%", "Overload, short-circuit, and reverse polarity protection", "Silent operation with adaptive fan cooling"]', 1),

(13, 3, '2 kVA / 24V MPPT Solar PCU Inverter', '2-kva-24v-mppt-solar-pcu-inverter',
 'High-efficiency 2000VA Power Conditioning Unit (PCU) with advanced tracking algorithm that extracts up to 30% more energy from solar panels.',
 'Supports high voltage solar panel arrays and powers heavy household inductive loads like refrigerators and water pumps.',
 16200.00, 18.00, '85044090', 16, 'in_stock', '/images/products/offgrid-inverter-2kva.svg', '2-Year Warranty',
 '{"Rated Capacity": "2000 VA / 1600 Watts", "Battery Nominal Voltage": "24V DC (2 Batteries)", "Solar Controller": "rMPPT 50A", "Max PV Array": "2000 Wp (Voc: 40V - 90V)", "Efficiency": "94.5%"}',
 '["Multi-colour LCD display shows solar generation, load %, and battery health", "Can run 1 HP submersible or centrifugal water pump", "Grid bypass mode for uninterrupted power supply", "Rugged design built for Nashik rural voltage fluctuations"]', 0),

(14, 3, '3 kVA / 36V Smart Solar PCU with LCD Display', '3-kva-36v-smart-solar-pcu-with-lcd-display',
 'Heavy-duty 3kVA solar PCU designed for bungalows, clinics, and offices requiring continuous high-load solar backup.',
 'Intelligent load sharing automatically distributes demand between solar, battery, and grid to ensure minimum grid bill.',
 25500.00, 18.00, '85044090', 12, 'in_stock', '/images/products/solar-inverter-3kva-hybrid.svg', '3-Year Manufacturer Warranty',
 '{"Rated Capacity": "3000 VA / 2400 Watts", "Battery System": "36V DC (3 Batteries)", "Charge Controller": "Dual MPPT 60A", "Max Solar Input": "3000 Wp", "Peak Inverter Efficiency": "95.2%"}',
 '["Priority mode: Solar -> Battery -> Grid for lowest possible bills", "Supports heavy loads: 1.5 Ton Inverter AC, deep freezers, and printers", "Digital diagnostic screen with error logs and daily unit meter", "DG Genset compatible input synchronization"]', 1),

(15, 3, '5 kVA / 48V Hybrid Solar Inverter with WiFi', '5-kva-48v-hybrid-solar-inverter-with-wifi',
 'Premium 5kW hybrid solar inverter that works both on-grid (exporting excess units) and off-grid with 48V battery bank.',
 'Features integrated WiFi monitoring so you can check live solar generation, battery status, and savings from your smartphone anywhere.',
 48000.00, 18.00, '85044090', 8, 'in_stock', '/images/products/solar-pcu-5kva.svg', '5-Year Comprehensive Warranty',
 '{"Rated Power": "5000 Watts (5 kW)", "Battery Support": "48V DC (Tubular or LiFePO4 Lithium)", "MPPT Channels": "Dual MPPT (2x 15A, 120V - 450V)", "Grid Interactive": "Yes (Zero-export or Net Metering capable)", "Connectivity": "WiFi / RS485 / Mobile App"}',
 '["True Hybrid: Export excess power to grid or store in batteries", "Seamless 10ms transfer switch prevents desktop and TV resets", "Plug-and-play BMS communication with Lithium batteries", "High surge rating up to 10,000 VA for motor startup"]', 1),

(16, 3, '10 kVA Three-Phase On-Grid Solar Inverter', '10-kva-three-phase-on-grid-solar-inverter',
 'Commercial grade 10 kW 3-phase grid-tied string inverter with 98.6% peak European efficiency, dual MPPT trackers, and IP65 weatherproof casing.',
 'Engineered for commercial rooftop solar plants, grape cold storages, winery facilities, and institutions in Dindori and Nashik.',
 76000.00, 18.00, '85044090', 6, 'in_stock', '/images/products/ongrid-inverter-10kva.svg', '8-Year Warranty (Extendable to 15 Yrs)',
 '{"Rated AC Output": "10,000 W (Three Phase 415V)", "Max PV Array Input": "15,000 Wp", "MPPT Trackers": "2 Trackers / 2 Strings each", "Protection": "IP65 Outdoor Cast Aluminium Enclosure", "Efficiency": "98.6% Peak Efficiency"}',
 '["Dual MPPT for roofs facing two different sun directions", "Built-in DC isolator switch and Type II surge protection (SPD)", "Full cloud monitoring portal with mobile dashboard", "Approved by MSEDCL for three-phase commercial net metering"]', 0),

-- BATTERIES
(17, 4, '150Ah / 12V Tall Tubular Solar C10 Battery', '150ah-12v-tall-tubular-solar-c10-battery',
 'Industry benchmark C10 rated tall tubular lead-acid battery with high pressure die-cast spine plates for long cycle life.',
 'Withstands deep discharge cycles and intense heat. The most dependable companion for residential solar inverters in rural Maharashtra.',
 14800.00, 18.00, '85072000', 40, 'in_stock', '/images/products/tubular-battery-150ah.svg', '60-Month Warranty (36 Mo Replacement + 24 Mo Pro-rata)',
 '{"Nominal Voltage": "12 Volts", "Capacity @ C10": "150 Ah", "Technology": "Spine Die-Cast Tall Tubular Plates", "Dimensions": "505 x 190 x 410 mm", "Electrolyte": "High Purity Battery Grade Dilute H2SO4", "Weight (Filled)": "54 kg"}',
 '["Special C10 discharge rating engineered specifically for solar applications", "Ceramic vent plugs with level indicators for easy water check", "Performs reliably up to 1500 discharge cycles @ 80% DOD", "Ultra-low water loss reduces top-up frequency to once a year"]', 1),

(18, 4, '200Ah / 12V Heavy Duty Tubular Solar Battery', '200ah-12v-heavy-duty-tubular-solar-battery',
 'Heavy duty 200Ah C10 tall tubular battery built for extended power cut durations in rural Dindori and agricultural belts.',
 'Extra thick positive spine plates resist grid corrosion and ensure deep discharge recovery after consecutive cloudy monsoon days.',
 19500.00, 18.00, '85072000', 25, 'in_stock', '/images/products/tubular-battery-200ah.svg', '60-Month Comprehensive Warranty',
 '{"Nominal Voltage": "12 Volts", "Capacity @ C10": "200 Ah", "Type": "Tall Tubular Deep Cycle", "Dimensions": "505 x 190 x 440 mm", "Filled Weight": "65 kg"}',
 '["High backup capacity: supplies 400W continuous load for ~5 hours", "Robust antimony-selenium alloy grids eliminate plate peeling", "Exceptional recharge acceptance even from weak solar radiation", "Shock-proof heavy duty container with sturdy carrying handles"]', 1),

(19, 4, '100Ah / 48V LiFePO4 Lithium Solar Battery (5.12 kWh)', '100ah-48v-lifepo4-lithium-solar-battery-5kwh',
 'Modern Lithium Iron Phosphate (LiFePO4) 48V wall-mount / rack battery with integrated Smart Battery Management System (BMS).',
 'Zero maintenance, 4x faster charging, and 15+ years lifespan. Replaces 4 bulky lead-acid batteries with a sleek compact unit.',
 68000.00, 18.00, '85072000', 10, 'in_stock', '/images/products/lithium-solar-battery-100ah.svg', '10-Year Manufacturer Warranty',
 '{"Usable Energy": "5.12 kWh (48V / 100Ah)", "Chemistry": "Lithium Iron Phosphate (LiFePO4)", "Cycle Life": "6,000+ Cycles @ 80% DOD", "Max Charge/Discharge": "100 A", "Dimensions": "482 x 450 x 178 mm", "Weight": "42 kg"}',
 '["15+ Year lifespan with over 6000 deep discharge cycles", "Charges to 100% in just 2 hours via solar or grid", "Built-in Smart BMS with over-temp, short-circuit and cell balancing", "Compact wall-mount design saves precious floor footprint"]', 1),

(20, 4, '150Ah / 48V Lithium Solar Smart Powerwall (7.68 kWh)', '150ah-48v-lithium-solar-smart-powerwall-7kwh',
 'High-capacity home energy storage powerhouse. Provides whole-home backup during load shedding with zero noise and zero emissions.',
 'Equipped with digital touch LCD screen displaying state-of-charge, cell voltages, cycle count, and CAN/RS485 communication ports.',
 98000.00, 18.00, '85072000', 5, 'in_stock', '/images/products/lithium-solar-battery-150ah.svg', '10-Year Warranty',
 '{"Usable Capacity": "7.68 kWh (51.2V / 150Ah)", "Cell Type": "Prismatic LiFePO4 Grade-A Cells", "Communication": "CAN / RS485 / RS232", "Operating Temp": "-10°C to 55°C", "Weight": "63 kg"}',
 '["Powers complete home including inverter ACs and water pump", "Real-time communication with Growatt, Havells, and Deye inverters", "Wall-mounted aesthetic modern design with LED indicators", "Modular design: up to 15 units can be connected in parallel"]', 0),

(21, 4, '150Ah / 12V Maintenance-Free Solar Gel Battery', '150ah-12v-maintenance-free-solar-gel-battery',
 'Sealed VRLA Gel battery with thixotropic gel electrolyte. Requires zero water topping up throughout its lifetime and emits no acid fumes.',
 'Ideal for indoor installations in bedrooms, clinics, and offices where safety and zero acid fumes are paramount.',
 17200.00, 18.00, '85072000', 14, 'in_stock', '/images/products/solar-gel-battery-150ah.svg', '36-Month Warranty',
 '{"Voltage": "12 Volts", "Capacity @ C10": "150 Ah", "Electrolyte": "Fumed Silica Gel Electrolyte (Non-spillable)", "Self-Discharge": "<2% per month @ 25°C"}',
 '["100% Sealed and maintenance-free; zero water topping required", "Zero toxic acid fumes: safe for indoor home living spaces", "Excellent recovery from deep discharge without plate sulfation", "High vibration and shock resistance"]', 0)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 4. Services
INSERT INTO `services` (`id`, `title`, `slug`, `short_desc`, `full_desc`, `icon`, `key_features`, `is_active`, `display_order`)
VALUES
(1, 'Rooftop Solar Installation', 'rooftop-solar-installation',
 'End-to-end turnkey rooftop solar installation for homes, agricultural farmhouses, and commercial buildings under PM Surya Ghar Yojana with MNRE subsidy.',
 'Shree Sai Enterprises handles everything from rooftop shadow analysis, civil structural engineering, Tier-1 Mono PERC panel mounting, inverter commissioning, to MSEDCL net meter installation.',
 'solar-panel', 
 '["Comprehensive shadow & structural roof feasibility survey", "MNRE and PM Surya Ghar portal vendor subsidy application", "Hot-dip galvanized heavy-duty mounting structures", "MSEDCL DisCom net-meter sanction and bi-directional meter setup", "25-year panel performance guarantee with on-site warranty"]', 1, 1),

(2, 'Solar Water Heater Installation', 'solar-water-heater-installation',
 'Professional installation, plumbing integration, and commissioning of Evacuated Tube (ETC) and Flat Plate (FPC) solar water heaters.',
 'We integrate the solar tank directly into your bathroom and kitchen hot water plumbing with insulated CPVC piping, safety pressure relief valves, and optional electrical backup heaters.',
 'droplet',
 '["Accurate roof sizing for 100 to 500+ LPD daily hot water needs", "High pressure booster pump compatible plumbing", "Corrosion-resistant rust-proof GI stand assembly", "Magnesium anode installation to combat hard groundwater", "Zero electricity bills for hot water 365 days a year"]', 1, 2),

(3, 'Solar Maintenance & AMC', 'solar-maintenance-amc',
 'Annual Maintenance Contracts (AMC) and periodic cleaning, inverter health checks, and string testing to guarantee peak power generation.',
 'Dust and agricultural pollen can reduce solar output by up to 25%. Our skilled technicians ensure your panels are spotless and your electrical joints are safe.',
 'shield-check',
 '["De-mineralized water panel cleaning with soft microfiber brushes", "Thermal imaging & hotspot detection on individual cells", "Inverter firmware updates and MPPT efficiency calibration", "ACDB/DCDB torque inspection and earthing resistance testing", "Priority on-call breakdown support within 24 hours"]', 1, 3),

(4, 'Consultation & Net Metering Liaison', 'consultation-net-metering',
 'Expert technical consultation, return-on-investment (ROI) analysis, and seamless government liaison with MSEDCL (Mahavitaran) for net metering.',
 'We take the headache out of government paperwork. We register your application on the national PM Surya Ghar portal, arrange DisCom inspection, and ensure subsidy release.',
 'file-text',
 '["Accurate 25-year financial ROI and payback period projection", "Preparation of SLD (Single Line Diagram) and technical drawings", "Filing on PM Surya Ghar Muft Bijli Yojana national portal", "DisCom / MSEDCL net metering approval and meter commissioning", "Assistance in securing low-interest bank solar rooftop loans"]', 1, 4),

(5, 'Repair & Technical Support', 'repair-and-support',
 'Fast on-site troubleshooting and component repair for all brands of solar inverters, charge controllers, water heaters, and broken panel glass.',
 'Facing inverter fault codes or low hot water temperature? Our Dindori-based technicians reach your site promptly with genuine spare parts.',
 'wrench',
 '["Inverter board-level repair and capacitor/IGBT replacement", "Solar water heater glass tube replacement and inner tank descaling", "Battery desulfation, specific gravity tuning and terminal cleaning", "Loose MC4 connector and blown DC fuse replacement", "Emergency helpline: 9822414748 / 9422941187"]', 1, 5),

(6, 'Agricultural Solar Water Pumps', 'agricultural-solar-pumps',
 'Solar powered submersible and surface water pumping systems for orchards, vineyards, and agricultural fields across Dindori and Nashik.',
 'Pumps water reliably without relying on erratic rural electrical three-phase power schedules. Compatible with drip and sprinkler irrigation.',
 'sun',
 '["3 HP to 10 HP AC solar submersible & monoblock pump solutions", "VFD (Variable Frequency Drive) solar pump controller with MPPT", "Dry run, reverse polarity, and lightning surge protection", "Automatic water discharge from morning sunrise to sunset", "Dual-axis seasonal manual tracking structures for extra yield"]', 1, 6)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 5. Gallery Items (Installations, Materials, Documentation)
INSERT INTO `gallery` (`id`, `title`, `category`, `description`, `image_url`, `location`, `display_order`)
VALUES
(1, '3.3 kW PM Surya Ghar Rooftop Installation', 'Installations', 'Turnkey residential installation with 540W Mono PERC panels and net metering on elevated GI structure.', '/images/gallery/installation-rooftop-dindori-1.svg', 'Palkhed Road, Dindori', 1),
(2, '5 HP Agricultural Solar Water Pump for Vineyard', 'Installations', 'Solar water pump system powering drip irrigation across 4 acres of grapes in Dindori taluka.', '/images/gallery/installation-agricultural-pump-2.svg', 'Janori Shivar, Dindori', 2),
(3, '10 kW Commercial Solar System for Cold Storage', 'Installations', 'Commercial grid-tied solar system with 10kVA 3-phase inverter slashing monthly industrial tariff.', '/images/gallery/installation-commercial-factory-3.svg', 'MIDC Area, Dindori Nashik', 3),
(4, '200 LPD Solar Water Heater on Residential Villa', 'Installations', 'Non-pressurized 200 LPD ETC solar water heater mounted on reinforced terrace stand.', '/images/gallery/installation-residential-villa-4.svg', 'Sai Sankul, Dindori', 4),
(5, 'Fresh Stock Arrival of 550W Tier-1 Panels', 'Materials', 'Original shipment unboxing of high efficiency 550W Mono PERC half-cut modules at our Dindori warehouse.', '/images/gallery/materials-mono-panels-unboxing.svg', 'Shree Sai Enterprises Warehouse', 5),
(6, 'Hybrid Solar Inverters and Lithium Batteries Stock', 'Materials', 'In-stock inventory of smart hybrid solar inverters, PCUs, and LiFePO4 batteries ready for dispatch.', '/images/gallery/materials-hybrid-inverters-stock.svg', 'Dindori Warehouse', 6),
(7, 'Hot-Dip Galvanized Mounting Structures & Hardware', 'Materials', 'Heavy gauge 80-micron galvanized steel frames and stainless steel fasteners engineered for 30+ year lifespan.', '/images/gallery/materials-structure-galvanized.svg', 'Material Yard, Dindori', 7),
(8, 'PM Surya Ghar Yojana Official Vendor Registration', 'Documentation', 'Official vendor authorization and accreditation under the Ministry of New and Renewable Energy (MNRE).', '/images/gallery/documentation-pm-surya-ghar-subsidy.svg', 'MNRE / National Portal', 8),
(9, 'MSEDCL Net Metering Commissioning Certificate', 'Documentation', 'Successfully commissioned bi-directional net-meter certificate approved by Mahavitaran Nashik division.', '/images/gallery/documentation-net-metering-approval.svg', 'MSEDCL Nashik Circle', 9),
(10, 'Certified Electrical Testing & Inspection Report', 'Documentation', 'Official safety compliance and chemical earthing resistance inspection report signed by chartered electrical engineer.', '/images/gallery/documentation-inspection-certificate.svg', 'Dindori, Nashik', 10)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 6. Sample Initial Quote
INSERT INTO `quotes` 
(`id`, `quote_number`, `customer_name`, `customer_phone`, `customer_email`, `customer_address`, `city`, `district`, `pincode`, `customer_notes`, `subtotal`, `discount_amount`, `taxable_amount`, `cgst_amount`, `sgst_amount`, `total_gst`, `grand_total`, `grand_total_words`, `status`)
VALUES
(1, 'SSE/2024-25/001', 'Rajesh K. Patil', '9822113344', 'rajeshpatil.nashik@gmail.com', 'Plot No. 14, Shanti Nagar, Near Market Yard', 'Dindori', 'Nashik', '422202', 'Require 3kW rooftop solar quotation with PM Surya Ghar subsidy details and net-metering.', 165000.00, 5000.00, 160000.00, 9600.00, 9600.00, 19200.00, 179200.00, 'Rupees One Lakh Seventy-Nine Thousand Two Hundred Only', 'Replied')
ON DUPLICATE KEY UPDATE `quote_number` = VALUES(`quote_number`);

INSERT INTO `quote_items` 
(`quote_id`, `product_id`, `product_name`, `category_name`, `hsn_code`, `quantity`, `unit_price`, `discount`, `taxable_amount`, `gst_rate`, `cgst_amount`, `sgst_amount`, `total_amount`)
VALUES
(1, 6, 'PM Surya Ghar 3kW Complete Rooftop Package', 'Solar Panels', '85414011', 1, 165000.00, 5000.00, 160000.00, 12.00, 9600.00, 9600.00, 179200.00)
ON DUPLICATE KEY UPDATE `product_name` = VALUES(`product_name`);
