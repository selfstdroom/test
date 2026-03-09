# StudyLab Free v7

LINEリッチメニューから開く前提の、無料版の完成構成です。

残した機能
- ホーム
- 自習室
- タスク
- 記録
- ティップス
- バックアップ保存 / 復元 / 全削除

削ったもの
- 目標設定
- 学習計画
- 中途半端な未完成機能

保存方式
- localStorage（この端末・このブラウザ内）
- JSONバックアップ保存 / 復元あり

## ローカル確認
python -m http.server 8000

http://localhost:8000

## LINEで使うとき
- LIFFを使うなら config.js の LIFF_ID を設定
- リッチメニューのURLにこのアプリのURLを設定
