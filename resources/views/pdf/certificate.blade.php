<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sertifikat Diklatsar BSMI - {{ $volunteer->name }}</title>
    <style>
        @font-face {
            font-family: 'Cinzel';
            font-style: normal;
            font-weight: 700;
            src: url(https://fonts.gstatic.com/l/font?kit=8vIU7ww63mVu7gtR-kwKxNvkNOjw-jHgTYs&skey=f319ae43d1034808&v=v26) format('truetype');
        }
        
        @page {
            size: 297mm 210mm; /* A4 landscape */
            margin: 0;
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            margin: 0;
            padding: 0;
            background-color: #fff;
            width: 297mm;
            height: 209mm;
            position: relative;
            overflow: hidden;
            color: #111827;
        }
        .certificate-wrapper {
            position: absolute;
            top: 10mm;
            left: 10mm;
            width: 277mm; 
            height: 189mm;
            background-color: #fdfbf7;
            background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgNTAgUSAyNSAzMCwgNTAgNTAgVCAxMDAgNTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2U1ZTdlYiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48L3N2Zz4=');
            overflow: hidden;
            box-sizing: border-box;
        }
        .certificate-border-outer {
            border: 4px solid #b91c1c;
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            box-sizing: border-box;
        }
        .certificate-border-inner {
            border: 2px solid #d4af37;
            position: absolute;
            top: 6px; left: 6px; right: 6px; bottom: 6px;
            box-sizing: border-box;
            padding: 20px 30px;
            text-align: center;
        }
        
        .corner-tl, .corner-tr, .corner-bl, .corner-br {
            position: absolute;
            width: 35px;
            height: 35px;
            border: 4px solid #d4af37;
        }
        .corner-tl { top: -4px; left: -4px; border-right: none; border-bottom: none; }
        .corner-tr { top: -4px; right: -4px; border-left: none; border-bottom: none; }
        .corner-bl { bottom: -4px; left: -4px; border-right: none; border-top: none; }
        .corner-br { bottom: -4px; right: -4px; border-left: none; border-top: none; }

        .header { margin-bottom: 5px; position: relative; z-index: 10; }
        .logo { max-height: 75px; width: auto; margin-bottom: 5px; }
        
        .title {
            font-family: 'Cinzel', 'Old English Text MT', 'Times New Roman', serif;
            font-size: 48px;
            font-weight: 700;
            color: #b91c1c;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 5px;
        }
        .subtitle {
            font-size: 16px;
            color: #047857; /* Emerald Green */
            margin-top: 4px;
            font-weight: bold;
            letter-spacing: 3px;
        }
        .cert-number {
            margin-top: 8px;
            font-size: 14px;
            font-style: italic;
            color: #4b5563;
            letter-spacing: 1px;
        }
        
        .content {
            margin-top: 5px;
            line-height: 1.5;
            position: relative;
            z-index: 10;
        }
        .text-awarded {
            font-size: 15px;
            color: #4b5563;
            margin-bottom: 0px;
            font-style: italic;
        }
        .name {
            font-family: 'Times New Roman', Times, serif;
            font-style: italic;
            font-size: 40px;
            font-weight: bold;
            color: #111827;
            margin: 0;
            border-bottom: 2px solid #d4af37;
            display: inline-block;
            padding-bottom: 2px;
            min-width: 500px;
        }
        .role {
            font-size: 18px;
            font-weight: bold;
            color: #b91c1c;
            margin-top: 2px;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .description {
            font-size: 16px;
            color: #374151;
            max-width: 850px;
            margin: 0 auto;
            line-height: 1.4;
            text-align: center;
        }
        .meta-info {
            margin-top: 8px;
            font-size: 13px;
            color: #4b5563;
            line-height: 1.5;
        }
        
        .footer {
            position: absolute;
            bottom: 25px;
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
            color: #111827;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: bold;
        }
        .signature-gap {
            height: 80px;
            text-align: center;
        }
        .signature-gap img {
            max-height: 80px;
            max-width: 200px;
        }
        .signature-name {
            font-size: 14px;
            font-weight: bold;
            color: #111827;
            border-top: 1px solid #111827;
            display: inline-block;
            padding-top: 5px;
            min-width: 150px;
        }
        
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 400px;
            opacity: 0.05;
            z-index: 1;
        }
    </style>
</head>
<body>
    <div class="certificate-wrapper">
        <div class="certificate-border-outer">
            <div class="certificate-border-inner">
                <div class="corner-tl"></div>
                <div class="corner-tr"></div>
                <div class="corner-bl"></div>
                <div class="corner-br"></div>
                
                <img src="{{ public_path('images/logo_BSMI.jpg') }}" class="watermark" alt="Watermark BSMI">
                
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
                    
                    @if($setting->year_text || $setting->organizer)
                    <div class="meta-info">
                        @if($setting->year_text) Tahun Ke: <strong>{{ $setting->year_text }}</strong> <br> @endif
                        @if($setting->organizer) Penyelenggara: <strong>{{ $setting->organizer }}</strong> <br> @endif
                    </div>
                    @endif
                </div>

                <div class="footer">
                    <div class="signature-section">
                        <div class="signature-box" style="margin-top: 25px;">
                            <div class="signature-title">{{ $setting->signature_1_title ?: 'Ketua Umum' }}</div>
                            <div class="signature-gap">
                                @if($setting->signature_1_image)
                                    <img src="{{ storage_path('app/public/' . $setting->signature_1_image) }}" alt="TTD 1">
                                @endif
                            </div>
                            <div class="signature-name">{{ $setting->signature_1_name ?: 'Dr. M. Djazuli Ambari, SKM, M.Si' }}</div>
                        </div>
                        
                        <div class="signature-box">
                            <div style="font-size: 13px; color: #111827; margin-bottom: 8px;">
                                {{ $setting->location ?: '...................' }}, {{ $setting->date_text ?: '...................' }}
                            </div>
                            <div class="signature-title">{{ $setting->signature_2_title ?: 'Komandan Relawan' }}</div>
                            <div class="signature-gap">
                                @if($setting->signature_2_image)
                                    <img src="{{ storage_path('app/public/' . $setting->signature_2_image) }}" alt="TTD 2">
                                @endif
                            </div>
                            <div class="signature-name">{{ $setting->signature_2_name ?: 'Rizky Febriansyah' }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
