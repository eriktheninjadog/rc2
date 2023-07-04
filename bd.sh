REACTBUILDVERSION=$(date +%Y-%m-%d)-$(date +%T) &&
      sed -i -- 's/%REACTBUILDVERSION%/'$REACTBUILDVERSION'/g' build/index.html &&
      echo React Build Version = $REACTBUILDVERSION",
npm run build
scp -r build/* erik@chinese.eriktamm.com:/var/www/html
