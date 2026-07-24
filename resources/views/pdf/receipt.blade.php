<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Kwitansi - {{ $receipt->receipt_number }}</title>
    <style>
        @page {
            margin: 0px;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            margin: 0;
            padding: 15px; /* Sedikit padding agar tidak mepet potong */
        }
        .receipt-container {
            border: none;
            padding: 0;
            background: #fff;
        }
        .header {
            display: table;
            width: 100%;
            border-bottom: 2px solid #b91c1c; /* BSMI Red */
            padding-bottom: 6px;
            margin-bottom: 10px;
        }
        .header-logo {
            display: table-cell;
            width: 75px;
            vertical-align: middle;
        }
        .header-logo img {
            width: 70px;
        }
        .header-text {
            display: table-cell;
            vertical-align: middle;
        }
        .header-text h1 {
            margin: 0;
            color: #b91c1c;
            font-size: 16px;
            text-transform: uppercase;
        }
        .header-text p {
            margin: 3px 0 0;
            font-size: 10.5px;
            color: #555;
        }
        .title {
            text-align: center;
            font-size: 16pt;
            font-weight: bold;
            margin-bottom: 10px;
            text-decoration: underline;
            letter-spacing: 1.5px;
        }
        .content {
            width: 100%;
            font-size: 11px;
            line-height: 1.6;
        }
        .content td {
            vertical-align: top;
        }
        .label-col {
            width: 100px;
            font-style: italic;
        }
        .colon-col {
            width: 15px;
            text-align: center;
        }
        .value-col {
            border-bottom: 1px dotted #999;
            font-weight: bold;
        }
        .amount-box {
            background-color: #f3f4f6;
            border: 1px solid #e5e7eb;
            display: inline-block;
            padding: 6px 15px;
            font-size: 14px;
            font-weight: bold;
            border-radius: 6px;
            margin-top: 15px;
            float: left;
        }
        .footer {
            margin-top: 5px;
            width: 100%;
            font-size: 10px;
        }
        .signature-section {
            float: right;
            text-align: center;
            width: 200px;
        }
        .signature-img {
            height: 40px;
            object-fit: contain;
            margin: 2px 0;
        }
        .signature-name {
            font-weight: bold;
            text-decoration: underline;
        }
        .clear {
            clear: both;
        }
        
        <?php
            function penyebut($nilai) {
                $nilai = abs($nilai);
                $huruf = array("", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas");
                $temp = "";
                if ($nilai < 12) {
                    $temp = " ". $huruf[$nilai];
                } else if ($nilai <20) {
                    $temp = penyebut($nilai - 10). " belas";
                } else if ($nilai < 100) {
                    $temp = penyebut($nilai/10)." puluh". penyebut($nilai % 10);
                } else if ($nilai < 200) {
                    $temp = " seratus" . penyebut($nilai - 100);
                } else if ($nilai < 1000) {
                    $temp = penyebut($nilai/100) . " ratus" . penyebut($nilai % 100);
                } else if ($nilai < 2000) {
                    $temp = " seribu" . penyebut($nilai - 1000);
                } else if ($nilai < 1000000) {
                    $temp = penyebut($nilai/1000) . " ribu" . penyebut($nilai % 1000);
                } else if ($nilai < 1000000000) {
                    $temp = penyebut($nilai/1000000) . " juta" . penyebut($nilai % 1000000);
                } else if ($nilai < 1000000000000) {
                    $temp = penyebut($nilai/1000000000) . " milyar" . penyebut(fmod($nilai,1000000000));
                } else if ($nilai < 1000000000000000) {
                    $temp = penyebut($nilai/1000000000000) . " trilyun" . penyebut(fmod($nilai,1000000000000));
                }     
                return $temp;
            }
        
            function terbilang($nilai) {
                if($nilai<0) {
                    $hasil = "minus ". trim(penyebut($nilai));
                } else {
                    $hasil = trim(penyebut($nilai));
                }     
                return ucwords($hasil) . " Rupiah";
            }
        ?>
    </style>
</head>
<body>

    <div class="receipt-container">
        <div class="header">
            <div class="header-logo">
                @if($organization && $organization->logo_path)
                    <img src="{{ public_path('storage/' . $organization->logo_path) }}" alt="Logo">
                @else
                    <div style="width: 70px; height: 70px; background: #eee; border-radius: 35px;"></div>
                @endif
            </div>
            <div class="header-text">
                <h1>BULAN SABIT MERAH INDONESIA</h1>
                <p>{{ $organization ? $organization->address : 'Sekretariat BSMI' }}</p>
                @if($organization && $organization->phone)
                    <p>Telp: {{ $organization->phone }} | Email: {{ $organization->email }}</p>
                @endif
            </div>
        </div>

        <div class="title">KWITANSI / TANDA TERIMA</div>

        <table class="content">
            <tr>
                <td class="label-col">No. Transaksi</td>
                <td class="colon-col">:</td>
                <td class="value-col">{{ $receipt->receipt_number }}</td>
            </tr>
            <tr>
                <td class="label-col">Telah diterima dari</td>
                <td class="colon-col">:</td>
                <td class="value-col">BENDAHARA BSMI</td>
            </tr>
            <tr>
                <td class="label-col">Banyaknya uang</td>
                <td class="colon-col">:</td>
                <td class="value-col" style="background-color: #f9f9f9; padding-left: 10px;">
                    # {{ terbilang($receipt->amount) }} #
                </td>
            </tr>
            <tr>
                <td class="label-col">Untuk Pembayaran</td>
                <td class="colon-col">:</td>
                <td class="value-col">{{ $receipt->description }}</td>
            </tr>
        </table>

        <div class="footer">
            <div class="amount-box">
                Rp {{ number_format($receipt->amount, 0, ',', '.') }}
            </div>

            <div class="signature-section">
                <div style="white-space: nowrap;">Diterima di: Serang, {{ \Carbon\Carbon::parse($receipt->date)->translatedFormat('d F Y') }}</div>
                <div>Yang Menerima,</div>
                
                @if($receipt->signature_path)
                    <div>
                        <img src="{{ public_path('storage/' . $receipt->signature_path) }}" class="signature-img" alt="Tanda Tangan">
                    </div>
                @else
                    <div style="height: 45px;"></div>
                @endif
                
                <div class="signature-name">{{ $receipt->pic_name }}</div>
            </div>
            <div class="clear"></div>
        </div>
    </div>

</body>
</html>
