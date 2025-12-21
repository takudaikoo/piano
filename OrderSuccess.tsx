import React from 'react';
import { Link } from 'react-router-dom';

const OrderSuccess = () => {
    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                    ✓
                </div>
                <h1 className="text-2xl font-bold text-stone-800 mb-4">ご注文ありがとうございます！</h1>
                <p className="text-stone-600 mb-8 leading-relaxed">
                    注文が確定しました。<br />
                    確認メールをお送りしましたのでご確認ください。
                </p>

                <div className="bg-brand-50 border border-brand-100 rounded-xl p-6 mb-8 text-left">
                    <h3 className="font-bold text-brand-800 mb-3 text-center">お振込先案内</h3>
                    <p className="text-sm text-stone-600 mb-4 text-center">
                        以下の口座代金をお振込みください。<br />
                        入金確認後、商品を発送いたします。
                    </p>
                    <div className="space-y-2 text-sm font-mono bg-white p-4 rounded border border-brand-100">
                        <div className="flex justify-between"><span>銀行名</span><span className="font-bold">〇〇銀行</span></div>
                        <div className="flex justify-between"><span>支店名</span><span className="font-bold">本店営業部 (001)</span></div>
                        <div className="flex justify-between"><span>口座種別</span><span className="font-bold">普通</span></div>
                        <div className="flex justify-between"><span>口座番号</span><span className="font-bold">1234567</span></div>
                        <div className="flex justify-between"><span>口座名義</span><span className="font-bold">カ）ピアノプ</span></div>
                    </div>
                </div>

                <Link to="/" className="inline-block bg-stone-800 hover:bg-stone-700 text-white font-bold py-3 px-8 rounded-lg shadow transition-all">
                    トップページに戻る
                </Link>
            </div>
        </div>
    );
};

export default OrderSuccess;
