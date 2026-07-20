<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sertifikat Diklatsar BSMI - {{ $volunteer->name }}</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 0;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #fff;
            width: 100%;
            height: 100%;
        }
        .certificate-wrapper {
            width: 100%;
            height: 100%;
            padding: 15mm; /* Minimal left-right margin */
            box-sizing: border-box;
            margin: 0;
            background: #fff;
            position: relative;
            overflow: hidden;
            /* background-image: url('{{ public_path('images/sertifikattemplate.jpeg') }}'); */
            /* background-size: cover; */
            /* background-position: center; */
        }
        .certificate-border-outer {
            border: 4px solid #b91c1c;
            height: 100%;
            box-sizing: border-box;
            padding: 5px;
        }
        .certificate-border-inner {
            border: 1px solid #b91c1c;
            height: 100%;
            position: relative;
            box-sizing: border-box;
            padding: 20px 40px;
            text-align: center;
            background: rgba(255, 255, 255, 0.9);
        }
        .header {
            margin-bottom: 15px;
        }
        .logo {
            max-height: 70px;
            width: auto;
            margin-bottom: 10px;
        }
        .title {
            font-size: 32px;
            font-weight: bold;
            color: #1a1a1a;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 3px;
        }
        .subtitle {
            font-size: 14px;
            color: #dc2626;
            margin-top: 5px;
            font-weight: bold;
            letter-spacing: 2px;
        }
        .cert-number {
            margin-top: 10px;
            font-size: 13px;
            font-weight: bold;
            color: #4b5563;
            letter-spacing: 1px;
        }
        .content {
            margin-top: 25px;
            line-height: 1.5;
            position: relative;
            z-index: 10;
        }
        .text-awarded {
            font-size: 15px;
            color: #4b5563;
            margin-bottom: 5px;
            font-style: italic;
        }
        .name {
            font-size: 36px;
            font-weight: bold;
            color: #111827;
            margin: 5px 0;
            text-transform: uppercase;
            border-bottom: 2px solid #e5e7eb;
            display: inline-block;
            padding-bottom: 5px;
            min-width: 450px;
            letter-spacing: 1px;
        }
        .role {
            font-size: 18px;
            font-weight: bold;
            color: #b91c1c;
            margin-top: 5px;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .description {
            font-size: 14px;
            color: #374151;
            max-width: 800px;
            margin: 0 auto;
            line-height: 1.6;
        }
        .meta-info {
            margin-top: 15px;
            font-size: 13px;
            color: #4b5563;
            line-height: 1.6;
        }
        .footer {
            position: absolute;
            bottom: 20px;
            width: 100%;
            left: 0;
            z-index: 10;
        }
        .signature-section {
            display: flex;
            justify-content: space-between;
            padding: 0 100px;
        }
        .signature-box {
            text-align: center;
            width: 250px;
            display: inline-block;
            margin: 0 40px;
        }
        .signature-title {
            font-size: 12px;
            color: #4b5563;
            margin-bottom: 50px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .signature-name {
            font-size: 14px;
            font-weight: bold;
            color: #111827;
            border-bottom: 1px solid #111827;
            padding-bottom: 3px;
            margin-bottom: 3px;
        }
        .signature-position {
            font-size: 11px;
            color: #6b7280;
        }
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 140px;
            color: rgba(220, 38, 38, 0.04);
            font-weight: bold;
            z-index: 1;
            white-space: nowrap;
        }
    </style>
</head>
<body>
    <div class="certificate-wrapper">
        <div class="certificate-border-outer">
            <div class="certificate-border-inner">
                <div class="watermark">BSMI</div>
                
                <div class="header">
                    <img src="{{ public_path('images/logo_BSMI.jpg') }}" class="logo" alt="Logo BSMI">
                    <div class="title">SERTIFIKAT</div>
                    <div class="subtitle">PENDIDIKAN DAN LATIHAN DASAR RELAWAN</div>
                    <div class="subtitle">BULAN SABIT MERAH INDONESIA</div>
                    @if($setting->certificate_number)
                    <div class="cert-number">
                        No: {{ $setting->certificate_number }}
                    </div>
                    @endif
                </div>

                <div class="content">
                    <p class="text-awarded">Diberikan kepada:</p>
                    <div class="name">{{ $volunteer->name }}</div>
                    
                    <div class="role">
                        Sebagai: {{ $setting->role_text ?: 'Peserta' }}
                    </div>
                
                    <p class="description" style="white-space: pre-line;">
                        {{ $setting->description_text }}
                    </p>
                    
                    @if($setting->year_text || $setting->organizer || $setting->location || $setting->date_text)
                    <div class="meta-info">
                        @if($setting->year_text) Tahun Ke: <strong>{{ $setting->year_text }}</strong> <br> @endif
                        @if($setting->organizer) Penyelenggara: <strong>{{ $setting->organizer }}</strong> <br> @endif
                        @if($setting->location || $setting->day_text || $setting->date_text)
                        Tempat / Waktu: <strong>{{ $setting->location ?: '-' }}</strong>, {{ $setting->day_text ?: '' }} {{ $setting->date_text ?: '' }}
                        @endif
                    </div>
                    @endif
                </div>

                <div class="footer">
                    <div class="signature-section">
                        <div class="signature-box">
                            <div class="signature-title">{{ $setting->signature_1_title ?: 'Ketua Umum' }}</div>
                            <div class="signature-name">{{ $setting->signature_1_name ?: 'Dr. M. Djazuli Ambari, SKM, M.Si' }}</div>
                        </div>
                        
                        <div class="signature-box">
                            <div class="signature-title">{{ $setting->signature_2_title ?: 'Komandan Relawan' }}</div>
                            <div class="signature-name">{{ $setting->signature_2_name ?: 'Rizky Febriansyah' }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
