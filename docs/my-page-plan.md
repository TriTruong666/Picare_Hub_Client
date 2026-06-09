# My Page Plan

## 1. Feature Summary

`MyPage` la mot landing page to tinh 5 stage, dung de ke mot hanh trinh co cam xuc ro rang thay vi chi hien thi noi dung tinh. Trang nay uu tien trai nghiem full-screen, cuon theo tung khoanh khac, trong do motion la thanh phan cot loi de giu nhip va tao do "wow".

## 2. Primary User Action

Nguoi xem can duoc dan di qua 5 stage theo dung trinh tu cam xuc, tap trung vao viec kham pha cau chuyen, mo cac diem ky niem, doc loi nhan, va ket thuc bang gallery anh.

## 3. Design Direction

Huong tham my: romantic, cinematic, dreamy. Tong the can co cam giac nhu mot buc thu tinh duoc san thanh mot micro-site, khong phai mot trang portfolio hay landing page thong thuong.

Du an nay rat chu trong motion. GSAP can duoc xem la lop animation chinh cho cac transition lon, scene reveal, parallax, constellation progression, modal open choreography, typing handoff, va gallery entrances. Uu tien do muot, nhip chuyen canh co chu y do, va cam giac "living UI" hon la chi them hieu ung.

## 4. Layout Strategy

Moi stage chiem it nhat 1 man hinh.

1. Stage 1: hero toi gian, header va mot cum text trung tam rat lon de chot tone.
2. Stage 2: gioi thieu nguoi yeu bang layout de tho, co the gom short bio, traits, hoac quote.
3. Stage 3: hero dac biet nhat, background la dai ngan ha full-width/full-height. O giua la mot duong chom sao co 6 nodes. Moi node la mot moc ky niem va mo duoc noi dung chi tiet.
4. Stage 4: loi nhan chinh, dung typing animation co pacing cham va co chu y de tao cao trao.
5. Stage 5: gallery anh, uu tien cam giac ket man am ap, co the la masonry hoac strip cuon ngang.

## 5. Key States

- Default: vao stage 1 voi intro rat sach, text vao canh muot.
- Scroll transition: moi stage vao man theo progression ro rang, khong jump.
- Constellation idle: cac node sang nhe, duong noi co chuyen dong rat tinh te.
- Constellation active: click node se focus node do va mo noi dung ky niem.
- Modal open: khong bung dot ngot; can co zoom/fade/chuyen tam diem ro.
- Typing stage: co idle state truoc khi typing bat dau, tranh vao la chay ngay qua nhanh.
- Gallery loaded: anh vao theo nhom, tranh load cam giac roi rac.
- Reduced motion fallback: neu can, giam parallax va giam transition do dai.

## 6. Interaction Model

- Scroll la truc dan chuyen chinh giua 5 stage.
- GSAP ScrollTrigger phu hop cho stage pin, reveal, scrub motion, va stagger.
- Stage 3 dung click/tap vao 6 dots de mo tung ky niem. Co the uu tien popover/panel inline truoc, modal chi dung neu noi dung can tap trung cao.
- Stage 4 dung typing animation co control bat dau sau khi stage du visible.
- Stage 5 co hover motion nhe tren desktop va touch-friendly tren mobile.

## 7. Content Requirements

- Stage 1: 1 cum heading chinh, 1 sub-line ngan neu can.
- Stage 2: ten/goi y ve nguoi yeu, 3-6 diem mo ta nho, hoac 1 doan gioi thieu ngan.
- Stage 3: 6 moc noi dung, moi moc can title, mo ta ngan, co the kem ngay thang/anh/icon.
- Stage 4: 1 loi nhan day du, tach dong theo nhip typing hop ly.
- Stage 5: danh sach anh, alt text, thu tu uu tien.

## 8. Motion and GSAP Requirements

- Dung GSAP cho stage transition quan trong, khong dua het vao CSS transition.
- Uu tien `ScrollTrigger` cho scrub/parallax/pin.
- Uu tien timeline ro rang cho stage 1 intro, stage 3 constellation reveal, stage 4 typing handoff, va stage 5 gallery entrance.
- Motion phai co nhiet do cam xuc: mo dau nhe, giua ky ao, cao trao cham, ket thuc am.
- Tinh den mobile performance ngay tu dau: tranh filter qua nang, tranh qua nhieu layer animate cung luc.

## 9. Implementation Roadmap

1. Tao shell 5 stage va state/navigation co ban.
2. Chot font pairing va palette cho page nay.
3. Build stage 1 hero.
4. Build stage 2 intro.
5. Build stage 3 galaxy + constellation map + 6 memory items.
6. Them GSAP timelines va scroll orchestration.
7. Build stage 4 typing message.
8. Build stage 5 gallery.
9. Polish responsive, reduced motion, preload asset, va tuning performance.

## 10. Open Questions

- Stage 3 nen dung modal dung nghia hay panel/noi dung mo rong inline de tranh cat dong scroll?
- Gallery cuoi nen la luoi masonry, carousel, hay strip cuon ngang?
- Stage 1 heading chinh se dung font script, display, hay mix 2 font?
- Co can nhac nen/xu ly am thanh hay giu im lang de tap trung vao motion?
