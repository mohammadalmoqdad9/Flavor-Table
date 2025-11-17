document.addEventListener('DOMContentLoaded', () => {
    // 1. تحديد عناصر DOM الأساسية (Search/Results)
    const searchButton = document.getElementById('search-button');
    const ingredientsInput = document.getElementById('ingredients-input');
    const resultsContainer = document.getElementById('results-container');
    const loadingMessage = document.getElementById('loading-message');
    const errorMessage = document.getElementById('error-message');

    // 2. تحديد عناصر DOM الخاصة بالـ Modal (المهمة الإضافية)
    const recipeModal = document.getElementById('recipe-modal');
    const closeButton = document.querySelector('.close-button');
    const detailTitle = document.getElementById('detail-title');
    const detailSummary = document.getElementById('detail-summary');
    const detailCookingTime = document.getElementById('detail-cooking-time');
    const detailImageContainer = document.getElementById('detail-image-container');
    const loadingDetails = document.querySelector('.loading-details');
    const errorDetails = document.querySelector('.error-details');


    // 3. دالة مساعدة لإظهار/إخفاء رسائل التحميل والخطأ
    const setMessages = (loading = false, error = null) => {
        loadingMessage.classList.toggle('hidden', !loading);
        errorMessage.classList.toggle('hidden', !error);
        errorMessage.textContent = error || '';
    };

    // 4. دالة لجلب وعرض تفاصيل الوصفة في الـ Modal (المهمة الإضافية)
    const fetchRecipeDetails = async (recipeId, recipeImage, recipeTitle) => {
        // تنظيف المحتوى السابق
        detailSummary.innerHTML = '';
        detailCookingTime.textContent = '';
        errorDetails.classList.add('hidden');
        
        // عرض البيانات الثابتة
        detailTitle.textContent = recipeTitle;
        detailImageContainer.innerHTML = `<img src="${recipeImage}" alt="${recipeTitle}">`;

        loadingDetails.classList.remove('hidden');

        try {
            // استدعاء نقطة النهاية في الخادم لجلب المعلومات
            const response = await fetch(`/recipes/${recipeId}/information`);
            const data = await response.json();

            loadingDetails.classList.add('hidden');

            if (response.status !== 200) {
                errorDetails.classList.remove('hidden');
                errorDetails.textContent = data.error || 'failed to retrieve details   .';
                return;
            }

            // عرض التفاصيل المطلوبة
            // إزالة وسوم HTML من الملخص لعرض أنظف
            const cleanSummary = data.summary ? data.summary.replace(/<[^>]*>?/gm, '') : ' not available.';
            
            detailSummary.innerHTML = cleanSummary;
            detailCookingTime.textContent = (data.cookingTime || ' not available') + ' minute';

        } catch (error) {
            loadingDetails.classList.add('hidden');
            errorDetails.classList.remove('hidden');
            errorDetails.textContent = '   unable to connect to the server to retrieve details .';
            console.error('Fetch Details Error:', error);
        }
    };

    // 5. دالة لفتح الـ Modal والبدء بجلب التفاصيل
    const handleViewDetails = (e) => {
        const recipeId = e.currentTarget.dataset.id;
        const recipeImage = e.currentTarget.dataset.image;
        const recipeTitle = e.currentTarget.dataset.title;
        
        if (recipeModal) {
            recipeModal.classList.remove('hidden'); // فتح الـ Modal
            fetchRecipeDetails(recipeId, recipeImage, recipeTitle);
        }
    };
    
    // 6. دالة حفظ الوصفات في الذاكرة المحلية (localStorage)
    const saveToFavorites = (recipe) => {
        let favorites = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
        
        // منع التكرار
        const isDuplicate = favorites.some(fav => fav.title === recipe.title);
        
        if (!isDuplicate) {
            // إذا كانت الوصفة من نتائج البحث، نظفها قبل الحفظ
            const recipeToSave = {
                title: recipe.title,
                image: recipe.image,
                // لكي يتمكن randomRecipes.html و favorites.html من عرضها
                ingredients: recipe.usedIngredients || recipe.ingredients || [],
                instructions: recipe.instructions || '' 
            };
            
            favorites.push(recipeToSave);
            localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
            alert(`  saved recipe "${recipe.title}" in favorite !`);
        } else {
            alert(`recipe "${recipe.title}"   alredy exists in .`);
        }
    };

    // 7. دالة إنشاء بطاقة الوصفة (تُستخدم في جميع الصفحات)
    const createRecipeCard = (recipe, showSearchDetails = false) => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        
        // تجهيز HTML للمكونات حسب نوع العرض (بحث أو عشوائي)
        let ingredientsHtml = '';
        if (showSearchDetails && recipe.usedIngredients && recipe.missedIngredients) {
            // تفاصيل خاصة بنتائج البحث
            ingredientsHtml = `
                <p><strong>components available :</strong> ${recipe.usedIngredients.join(', ')}</p>
                <p><strong> missing components:</strong> ${recipe.missedIngredients.join(', ')}</p>
            `;
        } else if (recipe.instructions || recipe.ingredients) {
            // تفاصيل خاصة بالوصفة العشوائية/المفضلة
             ingredientsHtml = `
                <p><strong>components:</strong> ${recipe.ingredients ? recipe.ingredients.slice(0, 3).join(', ') + '...' : ' not available'}</p>
                <p><strong>instructions:</strong> ${recipe.instructions ? recipe.instructions.substring(0, 100).replace(/<[^>]*>?/gm, '') + '...' : ' not available'}</p>
            `;
        }

        card.innerHTML = `
            <img src="${recipe.image || 'placeholder.png'}" alt="${recipe.title}">
            <div class="card-content">
                <h3>${recipe.title}</h3>
                ${ingredientsHtml}
                
                <button class="save-btn" data-recipe='${JSON.stringify(recipe)}'>  save in the favorite</button>
                
                ${showSearchDetails ? `<button class="details-btn" data-id="${recipe.id}" data-image="${recipe.image}" data-title="${recipe.title}">view details </button>` : ''}
            </div>
        `;
        
        // ربط حدث زر الحفظ
        card.querySelector('.save-btn').addEventListener('click', (e) => {
            const recipeData = JSON.parse(e.currentTarget.dataset.recipe);
            saveToFavorites(recipeData);
        });

        // ربط حدث زر التفاصيل (للمهمة الإضافية)
        if (showSearchDetails && card.querySelector('.details-btn')) {
             card.querySelector('.details-btn').addEventListener('click', handleViewDetails);
        }

        return card;
    };


    // 8.    (Search Recipes)
    const searchRecipes = async () => {
        const ingredients = ingredientsInput.value.trim();
        resultsContainer.innerHTML = ''; 
        setMessages(true); 

        if (!ingredients) {
            setMessages(false, ' please enter at least one component in the search.');
            return;
        }

        try {
            const response = await fetch(`/recipes/search?ingredients=${ingredients}`);
            const data = await response.json();

            setMessages(false); 

            if (response.status !== 200 || data.error) {
                setMessages(false, data.error || '     an unknown error occurred during the search.');
                return;
            }
            
            const recipes = data.recipes || data; 

            if (recipes.length === 0) {
                 setMessages(false, data.message || '   sorry.no recipes were found with these ingredients');
                 return;
            }

            recipes.forEach(recipe => {
                resultsContainer.appendChild(createRecipeCard(recipe, true));
            });

        } catch (error) {
            console.error('Frontend Fetch Error:', error);
            setMessages(false, '       unable to connect to the server. please check if the server is running.');
        }
    };
    
    // 9. ربط أحداث البحث (Event Listeners for Search)
    if (searchButton) {
        searchButton.addEventListener('click', searchRecipes);
        ingredientsInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchRecipes();
            }
        });
    }

    // 10. ربط أحداث الـ Modal (Event Listeners for Modal)
    if (closeButton) {
        // إغلاق الـ Modal عند النقر على (X)
        closeButton.addEventListener('click', () => {
            recipeModal.classList.add('hidden');
        });
    }

    window.addEventListener('click', (event) => {
        // إغلاق الـ Modal عند النقر خارج الـ Modal
        if (event.target === recipeModal) {
            recipeModal.classList.add('hidden');
        }
    });


    // 11. تصدير الدوال لاستخدامها في صفحات randomRecipes.html و favorites.html
    window.createRecipeCard = createRecipeCard;
    window.saveToFavorites = saveToFavorites; 
});