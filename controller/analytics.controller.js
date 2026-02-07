import Subscription from "../modules/subscription.model.js";

export const getExpenseData = async (req, res, next) => {
    try {
        const { period = 'monthly' } = req.query; // monthly or yearly
        const subscriptions = await Subscription.find({ 
            user: req.user._id,
            status: 'active'
        });

        const currentDate = new Date();
        let expenseData = [];

        if (period === 'yearly') {
            // Calculate yearly data for the last 5 years
            const yearlyData = {};
            
            // Initialize last 5 years
            for (let i = 4; i >= 0; i--) {
                const year = currentDate.getFullYear() - i;
                yearlyData[year] = 0;
            }

            // Calculate yearly expenses
            subscriptions.forEach(sub => {
                const startDate = new Date(sub.startDate);
                const startYear = startDate.getFullYear();
                
                // Calculate yearly cost based on frequency
                let yearlyCost = sub.price;
                if (sub.frequency === 'monthly') {
                    yearlyCost = sub.price * 12;
                } else if (sub.frequency === 'weekly') {
                    yearlyCost = sub.price * 52; // 52 weeks per year
                } else if (sub.frequency === 'daily') {
                    yearlyCost = sub.price * 365; // 365 days per year
                }
                // yearly frequency is already yearly

                // Add to each year from start year
                for (let year = startYear; year <= currentDate.getFullYear(); year++) {
                    if (yearlyData.hasOwnProperty(year)) {
                        yearlyData[year] += yearlyCost;
                    }
                }
            });

            // Convert to array format
            expenseData = Object.entries(yearlyData).map(([year, amount]) => ({
                month: year.toString(),
                amount: Math.round(amount * 100) / 100
            }));
        } else {
            // Calculate monthly data for the last 12 months
            const monthlyData = {};
            
            // Initialize last 12 months
            for (let i = 11; i >= 0; i--) {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                const monthKey = date.toISOString().substring(0, 7); // YYYY-MM format
                monthlyData[monthKey] = 0;
            }

            // Calculate monthly expenses
            subscriptions.forEach(sub => {
                const startDate = new Date(sub.startDate);
                
                // Calculate monthly cost based on frequency
                let monthlyCost = sub.price;
                if (sub.frequency === 'yearly') {
                    monthlyCost = sub.price / 12;
                } else if (sub.frequency === 'weekly') {
                    monthlyCost = sub.price * 4.33; // Approximate weeks per month
                } else if (sub.frequency === 'daily') {
                    monthlyCost = sub.price * 30; // Approximate days per month
                }
                // monthly frequency is already monthly

                // Add to each month from start date
                const current = new Date(startDate);
                while (current <= currentDate) {
                    const monthKey = current.toISOString().substring(0, 7);
                    if (monthlyData.hasOwnProperty(monthKey)) {
                        monthlyData[monthKey] += monthlyCost;
                    }
                    current.setMonth(current.getMonth() + 1);
                }
            });

            // Convert to array format
            expenseData = Object.entries(monthlyData).map(([month, amount]) => ({
                month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                amount: Math.round(amount * 100) / 100
            }));
        }

        res.status(200).json({ 
            success: true, 
            data: expenseData 
        });
    } catch (error) {
        next(error);
    }
};

export const getCategoryData = async (req, res, next) => {
    try {
        const subscriptions = await Subscription.find({ 
            user: req.user._id,
            status: 'active'
        });

        // Group by category and calculate total amounts
        const categoryTotals = {};
        
        subscriptions.forEach(sub => {
            // Calculate monthly equivalent cost
            let monthlyCost = sub.price;
            if (sub.frequency === 'yearly') {
                monthlyCost = sub.price / 12;
            } else if (sub.frequency === 'weekly') {
                monthlyCost = sub.price * 4.33;
            } else if (sub.frequency === 'daily') {
                monthlyCost = sub.price * 30;
            }

            if (categoryTotals[sub.category]) {
                categoryTotals[sub.category] += monthlyCost;
            } else {
                categoryTotals[sub.category] = monthlyCost;
            }
        });

        // Convert to array format with colors
        const colors = [
            '#8884d8', '#82ca9d', '#ffc658', '#ff7300', 
            '#00ff00', '#ff00ff', '#00ffff', '#ffff00'
        ];

        const categoryData = Object.entries(categoryTotals).map(([category, value], index) => ({
            name: category.charAt(0).toUpperCase() + category.slice(1),
            value: Math.round(value * 100) / 100,
            color: colors[index % colors.length]
        }));

        res.status(200).json({ 
            success: true, 
            data: categoryData 
        });
    } catch (error) {
        next(error);
    }
};
