window.__INVITE__={config:{"groom":"محمد أديب طويل","groomLatin":"Mohamad Adib Tawil","bride":"رزان بطايحي","brideLatin":"Razan Bataihi","occasion":"wedding","date":"2026-12-18T19:00:00","dateText":"يوم الجمعة، ١٨ كانون الأول ٢٠٢٦","timeText":"الساعة السابعة مساءً","heroSub":"يتشرّفان بدعوتكم لمشاركتهما فرحة العمر","invitationText":"على ضفّةٍ يسكنها الضوء، وبقلوبٍ مفعمةٍ بالفرح، نتشرّف بدعوتكم لمشاركتنا أجمل لحظات حياتنا في حفل زفافنا. حضوركم شرفٌ لنا وبهجةٌ تكتمل بها فرحتنا.","verse":"وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً","groomParents":"نجل السيّد سالم عبد الكريم و السيّدة رفيف","brideParents":"كريمة السيّد حازم عبد الرحمن و السيّدة سُهى","venueName":"قاعة البحيرة للمناسبات","venueAddr":"بغداد — شارع أبو نؤاس","mapUrl":"https://www.google.com/maps/search/?api=1&query=Baghdad","program":[{"time":"٧:٠٠ مساءً","title":"استقبال الضيوف"},{"time":"٨:٠٠ مساءً","title":"دخول العروسين"},{"time":"٩:٠٠ مساءً","title":"العشاء"},{"time":"١٠:٣٠ مساءً","title":"السهرة والاحتفال"}],"notes":["يُرجى الحضور قبل الموعد بنصف ساعة","نتشرّف بحضوركم بأبهى حلّة","التصوير مسموح، شاركونا أجمل اللحظات","الدعوة تشمل حاملها والعائلة الكريمة"],"closingNote":"حضوركم يزيّن فرحتنا","hashtag":"#هلاهيل","contactLabel":"للاستفسار والتأكيد","contactName":"للتواصل","contactPhone":"+963992688759","whatsappUrl":"https://wa.me/+963992688759","musicVideoId":"boRd_GXsYWA","orderUrl":"https://wa.me/+963992688759","calendarTimezone":"Asia/Baghdad","images":{"painting":"assets/painting.webp"},"assets":{"entranceVideo":"assets/entrance.mp4","entrancePoster":"assets/entrance-poster.jpg","painting":"assets/painting.webp","shareImage":"assets/painting.webp","font":"assets/aldhabi.woff2"},"closingFamilies":"عائلة سالم عبد الكريم  &  عائلة حازم عبد الرحمن","siteUrl":"https://mohamad-adib-tawil.github.io/wedding-temp-bahira/"}};
window.WEDDING_SETTINGS=window.__INVITE__.config;
(function(){
  document.addEventListener('DOMContentLoaded',function(){
    var c=window.WEDDING_SETTINGS;
    document.title='دعوة زفاف '+c.groom+' & '+c.bride;
    var meta={
      'og:title':document.title,
      'og:description':c.dateText+' • '+c.venueName,
      'og:url':c.siteUrl,
      'og:image':c.assets.shareImage,
      'twitter:image':c.assets.shareImage
    };
    Object.keys(meta).forEach(function(key){var node=document.querySelector('meta[property="'+key+'"],meta[name="'+key+'"]');if(node)node.setAttribute('content',meta[key]);});
    var google=document.getElementById('googleCalendarLink');
    if(google){
      var parts=c.date.split('T'),wall=new Date(parts[0]+'T'+parts[1]+':00Z');
      var start=parts[0].replace(/-/g,'')+'T'+parts[1].replace(/:/g,'')+'00';
      var end=new Date(wall.getTime()+4*3600000).toISOString().slice(0,19).replace(/[-:]/g,'');
      var params=new URLSearchParams({action:'TEMPLATE',text:'دعوة زفاف '+c.groom+' & '+c.bride,dates:start+'/'+end,ctz:c.calendarTimezone,location:c.venueName+' — '+c.venueAddr,details:c.dateText});
      google.href='https://calendar.google.com/calendar/render?'+params.toString();google.target='_blank';google.rel='noopener';
    }
    var order=document.querySelector('#wedding-order a');if(order)order.href=c.orderUrl;
  });
})();
