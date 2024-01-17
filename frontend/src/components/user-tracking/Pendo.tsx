import Script from 'next/script'

import { useContext } from 'react';
import { MetadataContext } from 'src/contexts/MetadataContext';

export default function Pendo() {
  const { currentUser } = useContext(MetadataContext);
  if (currentUser?.user === undefined) return null;
  return (
    <>
      <Script>
        {`(function(apiKey){
    (function(p,e,n,d,o){var v,w,x,y,z;o=p[d]=p[d]||{};o._q=o._q||[];
    v=['initialize','identify','updateOptions','pageLoad','track'];for(w=0,x=v.length;w<x;++w)(function(m){
        o[m]=o[m]||function(){o._q[m===v[0]?'unshift':'push']([m].concat([].slice.call(arguments,0)));};})(v[w]);
        y=e.createElement(n);y.async=!0;y.src='https://cdn.pendo.io/agent/static/'+apiKey+'/pendo.js';
        z=e.getElementsByTagName(n)[0];z.parentNode.insertBefore(y,z);})(window,document,'script','pendo');
        // This function creates anonymous visitor IDs in Pendo unless you change the visitor id field to use your app's values
        // This function uses the placeholder 'ACCOUNT-UNIQUE-ID' value for account ID unless you change the account id field to use your app's values
        // Call this function after users are authenticated in your app and your visitor and account id values are available
        // Please use Strings, Numbers, or Bools for value types.
        pendo.initialize({
            visitor: {
                id: '` + currentUser?.user.email + `',   // Required if user is logged in, default creates anonymous ID
                email: '` + currentUser?.user.email + `',         // Recommended if using Pendo Feedback, or NPS Email
                full_name: '` + currentUser?.user.first_name + ' ' + currentUser?.user.last_name + `',   // Recommended if using Pendo Feedback
                username: '` + currentUser?.user.username + `',
                profile_id: '` + currentUser?.id + `'
                // role:         // Optional
                // You can add any additional visitor level key-values here,
                // as long as it's not one of the above reserved names.
            },
            account: {
                id:           '` + currentUser?.user.user_type + `' // Required if using Pendo Feedback, default uses the value 'ACCOUNT-UNIQUE-ID'
                // name:         // Optional
                // is_paying:    // Recommended if using Pendo Feedback
                // monthly_value:// Recommended if using Pendo Feedback
                // planLevel:    // Optional
                // planPrice:    // Optional
                // creationDate: // Optional
                // You can add any additional account level key-values here,
                // as long as it's not one of the above reserved names.
            }
        });
})('8c4a1c34-b34b-42e6-5abd-6ec5cd2c90c5');
  `}
      </Script>
    </>
  )
}