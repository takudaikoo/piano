import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OrderItem {
  title: string
  quantity: number
  price: number
}

interface OrderRequest {
  email: string
  name: string
  items: OrderItem[]
  total: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, name, items, total } = await req.json() as OrderRequest

    const itemListHtml = items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.title}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">x${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">¥${item.price.toLocaleString()}</td>
      </tr>
    `).join('')

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">ご注文ありがとうございます</h1>
        <p>${name} 様</p>
        <p>以下の内容でご注文を承りました。</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f9f9f9;">
              <th style="padding: 8px; text-align: left;">商品名</th>
              <th style="padding: 8px; text-align: left;">数量</th>
              <th style="padding: 8px; text-align: left;">金額</th>
            </tr>
          </thead>
          <tbody>
            ${itemListHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold;">合計</td>
              <td style="padding: 12px; font-weight: bold;">¥${total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-top: 30px; background-color: #f0f0f0; padding: 20px; border-radius: 8px;">
          <h3 style="margin-top: 0;">お振込み先</h3>
          <p>銀行名: 〇〇銀行</p>
          <p>支店名: 〇〇支店</p>
          <p>口座番号: 1234567</p>
          <p>口座名義: ピアノキョウシツ</p>
          <p style="font-size: 0.9em; color: #666;">※お振込み手数料はお客様負担となります。</p>
        </div>

        <p style="margin-top: 30px; font-size: 0.9em; color: #888;">
          このメールは送信専用です。
        </p>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Pianao教室 教材サイト <onboarding@resend.dev>', // Update this if user has a custom domain
        to: [email],
        subject: '【Pianao教室】ご注文ありがとうございます',
        html: htmlContent,
      }),
    })

    const data = await res.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
